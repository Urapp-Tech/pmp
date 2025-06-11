import re


def to_kebab_case(txt: str) -> str:
    return re.sub(r"\s+", "-", txt.lower()).strip("-")
