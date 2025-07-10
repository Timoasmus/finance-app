from bson import ObjectId


def aggregation_total_expense(user_id):
    return [
        {
            "$match": {"$and": [{"user_id": ObjectId(user_id)}, {"type": "expense"}]}
        },
        {"$group":
         {"_id": None, "total_amount": {"$sum": "$amount"}}
         },
        {
            "$project": {"total_amount": 1, "_id": 0}
        },
    ]


def aggregation_saldo(user_id):
    return [
        {
            "$match": {"user_id": ObjectId(user_id)}
        },
        {"$group":
         {"_id":
          {"type": "$type", "date": "$date"},
          "total_amount": {"$sum": "$amount"}
          }},
        {
            "$project": {
                "type": "$_id.type",
                "date": "$_id.date",
                "total_amount": 1,
                "_id": 0}
        },
        {
            "$sort": {
                "date": 1
            }
        }
    ]


def aggregation_by_date(user_id):
    return [
        {
            "$match": {"user_id": ObjectId(user_id)}
        },
        {"$group":
         {"_id":
          {"type": "$type", "date": "$date"},
          "total_amount": {"$sum": "$amount"}
          }},
        {
            "$project": {
                "type": "$_id.type",
                "date": "$_id.date",
                "total_amount": 1,
                "_id": 0}
        },
        {
            "$sort": {
                "date": 1
            }
        }
    ]


def aggregation_by_category(user_id):
    return [
        {
            "$match": {"user_id": ObjectId(user_id)}
        },
        {"$group":
         {"_id":
          {"type": "$type", "category": "$category"},
          "total_amount": {"$sum": "$amount"}
          }},
        {
            "$project": {
                "category": "$_id.category",
                "type": "$_id.type",
                        "total_amount": 1,
                        "_id": 0}
        },
    ]


def aggregation_total(user_id):
    return [
        {
            "$match": {"user_id": ObjectId(user_id)}
        },
        {"$group":
         {"_id": "$type", "total_amount": {"$sum": "$amount"}}
         },
        {
            "$project": {"type": "$_id", "total_amount": 1, "_id": 0}
        },
    ]


def aggregation_transactions(user_id):
    return [
        {
            "$match": {"user_id": ObjectId(user_id)}
        },
        {
            "$sort": {"date": -1}
        }
    ]


def filter_by_month(aggregation, month):
    aggregation.insert(1, {
        "$addFields": {
            "month": {"$month": "$date"}
        }
    })

    aggregation.insert(2, {
        "$match": {
            "month": month
        }
    })
