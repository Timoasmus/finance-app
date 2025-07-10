from fastapi import APIRouter, HTTPException, Depends
from backend.models.api_models import (TransactionOut, NewTransaction, Total,
                            ByCategory, ByDate, Budget, BudgetUpdate)
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import logging
from datetime import datetime
from backend.utils.helper_functions import (get_current_user, set_cache, get_from_cache, 
                               delete_cache, get_cache_key, raise_http500_exception, check_premium)
from bson import ObjectId
from typing import Optional
from backend.utils.aggregations import (filter_by_month, aggregation_by_category, aggregation_by_date,
                                  aggregation_saldo, aggregation_total, aggregation_total_expense,
                                  aggregation_transactions)
import sentry_sdk

logging.basicConfig(
    level=logging.INFO,
)
logger = logging.getLogger("route-logger")

load_dotenv(override=True)

router = APIRouter(prefix="/api")

MONGODB_URI = os.getenv("MONGODB_URI")

client = MongoClient(MONGODB_URI)

db = client.get_database("finance-tracker")


@router.get("/total_expense/", response_model=Budget)
def get_total_expense(month: Optional[int] = None, user: dict = Depends(get_current_user)):
    check_premium(user)
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    cache_key = get_cache_key(month, "total_expense", user_id)
    cache_key_budget = f"budget:{user_id}"
    try:
        total_expense = get_from_cache(cache_key)
        budget = get_from_cache(cache_key_budget)
        if total_expense and budget:
            return Budget(budget=budget, expenses=total_expense)
        
        aggregation = aggregation_total_expense(user_id)
        if month is not None:
            filter_by_month(aggregation, month)
        docs = list(db.transactions.aggregate(aggregation))

        total_expense = docs[0]["total_amount"] if docs else 0
       
        set_cache(cache_key, total_expense)
        user = db.users.find_one({"_id": ObjectId(user_id)})
        budget = user.get("budget")
        set_cache(cache_key_budget, budget)

        return Budget(expenses=total_expense, budget=budget)

    except Exception as e:
        raise_http500_exception(e)


@router.get("/saldo/", response_model=dict[datetime, float])
def get_saldo(month: Optional[int] = None, user: dict = Depends(get_current_user)):
    check_premium(user)
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    cache_key = get_cache_key(month, "saldo", user_id)
    try:
        saldo = get_from_cache(cache_key)
        if saldo:
            return saldo

        aggregation = aggregation_saldo(user_id)
        if month is not None:
            filter_by_month(aggregation, month)
        docs = list(db.transactions.aggregate(aggregation))

        for doc in docs:
            doc["date"] = doc["date"].isoformat()

        saldo = 0
        date_saldo = {}
        for entry in docs:
            if entry["type"] == "income":
                saldo += entry["total_amount"]
                date_saldo[entry["date"]] = saldo
            else:
                saldo -= entry["total_amount"]
                date_saldo[entry["date"]] = saldo

        set_cache(cache_key, date_saldo)
        return date_saldo

    except Exception as e:
        raise_http500_exception(e)


@router.get("/by_category/", response_model=list[ByCategory])
def get_by_category(month: Optional[int] = None, user: dict = Depends(get_current_user)):
    check_premium(user)
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    cache_key = get_cache_key(month, "by_category", user_id)
    try:
        by_category = get_from_cache(cache_key)
        if by_category:
            return by_category

        aggregation = aggregation_by_category(user_id)
        if month is not None:
            filter_by_month(aggregation, month)
        docs = list(db.transactions.aggregate(aggregation))

        set_cache(cache_key, docs)
        return docs

    except Exception as e:
        raise_http500_exception(e)


@router.get("/by_date/", response_model=list[ByDate])
def get_by_date(month: Optional[int] = None, user: dict = Depends(get_current_user)):
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    cache_key = get_cache_key(month, "by_date", user_id)
    try:
        by_date = get_from_cache(cache_key)
        if by_date:
            return by_date

        aggregation = aggregation_by_date(user_id)
        if month is not None:
            filter_by_month(aggregation, month)
        docs = list(db.transactions.aggregate(aggregation))

        for doc in docs:
            doc["date"] = doc["date"].isoformat()
        set_cache(cache_key, docs)
        return docs

    except Exception as e:
        raise_http500_exception(e)


@router.get("/total/", response_model=list[Total])
def get_total(month: Optional[int] = None, user: dict = Depends(get_current_user)):
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    cache_key = get_cache_key(month, "total", user_id)
    try:
        total = get_from_cache(cache_key)
        if total:
            return total
        

        aggregation = aggregation_total(user_id)
        if month is not None:
            filter_by_month(aggregation, month)
        docs = list(db.transactions.aggregate(aggregation))

        set_cache(cache_key, docs)
        return docs

    except Exception as e:
        raise_http500_exception(e)


@router.get("/transactions/", response_model=list[TransactionOut])
def get_transactions(month: Optional[int] = None, user: dict = Depends(get_current_user)):
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    cache_key = get_cache_key(month, "transactions", user_id)
    try:
        transactions = get_from_cache(cache_key)
        if transactions:
            return transactions
        
        aggregation = aggregation_transactions(user_id)
        if month is not None:
            filter_by_month(aggregation, month)
        docs = list(db.transactions.aggregate(aggregation))

        for doc in docs:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            del doc["user_id"]
            doc["date"] = doc["date"].isoformat()

        set_cache(cache_key, docs)
        return docs

    except Exception as e:
        raise_http500_exception(e)


@router.post("/transactions")
def add_transaction(new_transaction: NewTransaction, user: dict = Depends(get_current_user)):
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    try:
        doc = {
            "amount": new_transaction.amount,
            "date": new_transaction.date,
            "description": new_transaction.description,
            "category": new_transaction.category,
            "type": new_transaction.type.value,
            "user_id": ObjectId(user_id)
        }

        delete_cache(user_id, ["transactions", "total",
                     "by_category", "by_date", "saldo", "total_expense"])
        db.transactions.insert_one(doc)
        return {"message": "succes"}

    except Exception as e:
        raise_http500_exception(e)


@router.delete("/transactions")
def delete_transactions(ids: list[str], user: dict = Depends(get_current_user)):
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    try:
        object_ids = [ObjectId(id) for id in ids]

        result = db.transactions.delete_many({
            "_id": {"$in": object_ids},
            "user_id": ObjectId(user_id)
        })

        delete_cache(user_id, ["transactions", "total",
                     "by_category", "by_date", "saldo", "total_expense"])

        return {"message": f"Deleted {result.deleted_count}"}

    except Exception as e:
        raise_http500_exception(e)


@router.put("/transactions/{id}")
def edit_transaction(id: str, transaction: NewTransaction, user: dict = Depends(get_current_user)):
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    try:
        doc = {
            "amount": transaction.amount,
            "date": transaction.date,
            "description": transaction.description,
            "category": transaction.category,
            "type": transaction.type.value,
            "user_id": ObjectId(user_id)
        }

        db.transactions.replace_one({"_id": ObjectId(id)}, doc)

        delete_cache(user_id, ["transactions", "total",
                     "by_category", "by_date", "saldo", "total_expense"])

        return {"message": "Updated transaction!"}

    except Exception as e:
        raise_http500_exception(e)


@router.put("/budget")
def change_budget(update: BudgetUpdate, user: dict = Depends(get_current_user)):
    user_id = user.get("user_id")
    sentry_sdk.set_user({"id": user_id})
    try:
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"budget": update.new_budget}})
        delete_cache(user_id, ["budget"])

    except Exception as e:
        raise_http500_exception(e)
