from fastapi import APIRouter, Depends, HTTPException, status
import logging
from utils.helper_functions import get_current_user, raise_http500_exception
from bson import ObjectId
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from models.api_models import Widgets

logging.basicConfig(
    level=logging.INFO
)

logger = logging.getLogger("widget-logger")

load_dotenv(override=True)

MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client.get_database("finance-tracker")

router = APIRouter(prefix="/widgets")


@router.get("")
def get_widgets(user_id: str = Depends(get_current_user)):
    try:
        doc = db.users.find_one({"_id": ObjectId(user_id)})
        return doc["widgets"]
    except Exception as e:
        logger.info(f"ERROR WHILE RETRIEVING WIDGETS: {str(e)}")
        raise_http500_exception(e)


@router.put("/remove/{widget}")
def remove_widget(widget: str, user_id: str = Depends(get_current_user)):
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        widgets = user.get("widgets")

        for loc, w in widgets.items():
            if w == widget:
                loc_to_empty = loc

        if not loc_to_empty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Widget not in user widgets")

        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {f"widgets.{loc_to_empty}": Widgets.empty_widget.value}})

    except Exception as e:
        logger.info(f"ERROR WHILE REMOVING WIDGET: {str(e)}")
        raise_http500_exception(e)


@router.put("/add/{widget}/{loc}")
def add_widget(widget: str, loc: str, user_id: str = Depends(get_current_user)):
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        widgets = user.get("widgets")

        if widgets.get(loc) != Widgets.empty_widget.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Widget is not empty")
        
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {f"widgets.{loc}": widget}}
        )

    except Exception as e:
        logger.info(f"ERROR WHILE ADDING WIDGET: {str(e)}")
        raise_http500_exception(e)
