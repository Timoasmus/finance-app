from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import Response
from models.auth_models import NewUser, Plan, Auth, ChangeSubscriptionRequest
from models.api_models import Widgets
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from passlib.context import CryptContext
from utils.helper_functions import raise_http500_exception
import logging
from datetime import timedelta, datetime
from jose import jwt, JWTError
from utils.helper_functions import decode_token, get_current_user
from bson import ObjectId
import sentry_sdk

logging.basicConfig(
    level=logging.INFO
)

logger = logging.getLogger("auth-logger")

load_dotenv(override=True)

router = APIRouter(prefix="/auth")

MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client.get_database("finance-tracker")

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM")

defaultLayout = {
    "tl": Widgets.history.value,
    "bl": Widgets.histogram.value,
    "mr": Widgets.empty_widget.value,
    "ml": Widgets.empty_widget.value,
    "tr": Widgets.empty_widget.value,
    "br": Widgets.empty_widget.value
}


@router.post("/create")
def create_user(new_user: NewUser):
    if db.users.find_one({"$or": [{"username": new_user.username}, {"email": new_user.email}]}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already exists")

    eightteen_years = timedelta(weeks=936)
    if new_user.dob.date() > (datetime.now() - eightteen_years).date():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Must be 18+ to join")
    
    try:
        db.users.insert_one(
            {"username": new_user.username,
             "hashed_password": pwd_ctx.hash(new_user.password),
             "email": new_user.email,
             "dob": new_user.dob,
             "widgets": defaultLayout,
             "budget": 2000.0,
             "plan": Plan.free.value}
        )

        return {"message": f"Welcome, {new_user.username}"}
    except Exception as e:
        raise_http500_exception(e)


@router.post("/login", response_model=Auth)
def login_user(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.users.find_one({"username": form_data.username})
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid username or password")
    
    plan = user.get("plan")

    pwd_is_right = pwd_ctx.verify(form_data.password, user["hashed_password"])

    if not pwd_is_right:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid username or password")

    access_token_expires = timedelta(minutes=30)
    access_token_exp = datetime.now() + access_token_expires

    refresh_token_expires = timedelta(hours=12)
    refresh_token_exp = datetime.now() + refresh_token_expires

    try:
        encoded_access_token = jwt.encode(
            {"sub": str(user.get("_id")),
             "plan": user.get("plan"),
             "type": "access",
             "exp": access_token_exp,
             "iat": datetime.now()},
            SECRET_KEY, algorithm=ALGORITHM
        )

        encoded_refresh_token = jwt.encode(
            {"sub": str(user.get("_id")),
             "type": "refresh",
             "exp": refresh_token_exp,
             "iat": datetime.now()},
            SECRET_KEY, algorithm=ALGORITHM
        )

    except JWTError as e:
        raise_http500_exception(e)

    response.set_cookie(
        key="access_token",
        value=encoded_access_token,
        httponly=True,
        samesite="lax",  
        secure=True, 
        max_age=30 * 60,
        path="/"
    )

    response.set_cookie(
        key="refresh_token",
        value=encoded_refresh_token,
        httponly=True,
        samesite="lax",  
        secure=True,  
        max_age=12 * 60 * 60,
        path="/")

    return Auth(authenticated=True, plan=plan)


@router.get("/refresh", response_model=Auth)
def refresh(response: Response, refresh_token: str = Cookie(None)):
    if not refresh_token:
        return Auth(authenticated=False)

    try:
        decoded_token = decode_token(refresh_token)
        user_id = decoded_token.get("user_id")
        type = decoded_token.get("type")

        if type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type")

        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found")

        plan = user.get("plan")
    except HTTPException:
        return Auth(authenticated=False)

    access_token_expires = timedelta(minutes=30)
    access_token_exp = datetime.now() + access_token_expires

    try:
        encoded_access_token = jwt.encode(
            {"sub": user_id,
             "plan": plan,
             "type": "access",
             "exp": access_token_exp,
             "iat": datetime.now()},
            SECRET_KEY, algorithm=ALGORITHM)

    except JWTError as e:
        raise_http500_exception(e)

    response.set_cookie(
        key="access_token",
        value=encoded_access_token,
        httponly=True,
        samesite="lax", 
        secure=True,  
        max_age=30 * 60,
        path="/"
    )

    return Auth(authenticated=True, plan=plan)


@router.get("/verify", response_model=Auth)
def verify(access_token: str = Cookie(None)):
    if not access_token:
        return Auth(authenticated=False)

    try:
        decoded_token = decode_token(access_token)

        if decoded_token.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type")

        plan = decoded_token.get("plan")

    except HTTPException:
        return Auth(authenticated=False)

    return Auth(authenticated=True, plan=plan)


@router.get("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "succes"}


@router.put("/subscription")
def change_subscription(response: Response,
                        change_request: ChangeSubscriptionRequest,
                        user: dict = Depends(get_current_user)):
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        pwd_is_right = pwd_ctx.verify(
            change_request.password, user["hashed_password"])

        if not pwd_is_right:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Invalid password")

        plan = change_request.plan.value

        db.users.update_one({"_id": ObjectId(user_id)}, {
                            "$set": {"plan": plan, "widgets": defaultLayout}})
        response.delete_cookie(key="access_token", path="/")
        response.delete_cookie(key="refresh_token", path="/")
        return {"message": f"Changed plan to {plan}!"}

    except Exception as e:
        raise_http500_exception(e)
