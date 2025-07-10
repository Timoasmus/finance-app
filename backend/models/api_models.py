from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class TransactionType(Enum):
    income="income"
    expense="expense"

class Widgets(Enum):
    empty_widget=None
    histogram="histogram"
    history="history"
    piecharts="piecharts"
    saldograph="saldograph"
    transactiongraph="transactiongraph"
    budget="budget"

class NewTransaction(BaseModel):
    amount: float
    date: datetime
    description: str
    category: str
    type: TransactionType

class TransactionOut(NewTransaction):
    id: str

    class Config:
        from_attributes=True
    
class Total(BaseModel):
    type: TransactionType
    total_amount: float

    class Config:
        from_attributes=True

class ByCategory(BaseModel):
    type: TransactionType
    category: str
    total_amount: float

    class Config:
        from_attributes=True

class ByDate(BaseModel):
    type: TransactionType
    date: datetime
    total_amount: float

    class Config:
        from_attributes=True

class Budget(BaseModel):
    expenses: float
    budget: float

class BudgetUpdate(BaseModel):
    new_budget: float