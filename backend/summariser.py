"""
Transform a Heidi transcript into a structured VisitSummary
• LangChain + OpenAI
• Pydantic validation via OutputParser
• Callable from other modules *or* as a CLI script
"""

from __future__ import annotations
from pathlib import Path
import os
import json
import argparse
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from models import VisitSummary
from services.summary_formatter import format_summary

load_dotenv()

try:
    from models import VisitSummary
except ImportError as err:
    raise SystemExit(
        "Could not import `VisitSummary` Pydantic model. "
    ) from err

def get_transcript(session_id: str =None, mock: bool = True) -> str:
    """
    Fetch the transcript string for a given Heidi session.
    """
    if mock:
        # the Gist you shared earlier
        import requests, textwrap

        url = "https://gist.githubusercontent.com/kevin-x-cs/2fd6edd101fe68a3b20fc82dfb2daa2f/raw/eb3482402e56631d9628c4f556975934fb914427/gistfile1.txt"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()["transcript"]
    
    # implement actual fetching logic here with session_id


# ─── LangChain plumbing ─────────────────────────────────────────────────── #
load_dotenv()  # pulls OPENAI_API_KEY, OPENAI_MODEL, OPENAI_TEMPERATURE, …

parser = PydanticOutputParser(pydantic_object=VisitSummary)

_summary_prompt = """
You are a clinical documentation assistant.

Given the raw transcript of a patient-doctor consultation, generate a visit
summary that **strictly** matches the JSON schema below.

{format_instructions}

Transcript:
```text
{transcript}
```"""

prompt_tmpl = PromptTemplate(
    template=_summary_prompt,
    input_variables=["transcript"],
    partial_variables={
        "format_instructions": parser.get_format_instructions(),
    },
)

llm = ChatOpenAI(
    model_name=os.getenv("OPENAI_MODEL", "gpt-4o"),
    temperature=float(os.getenv("OPENAI_TEMPERATURE", 0)),
    api_key=os.getenv("OPENAI_API_KEY"),
    streaming=False,
)

# prompt  →  llm  →  JSON parser
chain = prompt_tmpl | llm | parser


def summarise_visit(transcript: str) -> VisitSummary:
    """
    Core entry-point: transcript (str) → VisitSummary instance
    """
    return chain.invoke({"transcript": transcript})


def main():
        
    transcript = get_transcript()
    summary = summarise_visit(transcript)

    print(summary)


if __name__ == "__main__":
    main()
