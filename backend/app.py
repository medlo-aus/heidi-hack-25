from fastapi import FastAPI
from pydantic import BaseModel
from summariser import summarise_visit, VisitSummary

app = FastAPI()

class Req(BaseModel):
    transcript: str

@app.post("/summary")
def summary(req: Req) -> VisitSummary:
    return summarise_visit(req.transcript)
