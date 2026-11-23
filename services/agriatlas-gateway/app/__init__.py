"""Agriculture Atlas Virtual Agro-Sensor & Open-Science Azure/Aurora SKU Gateway Package."""

from app.core.agro_physics_engine import (
    OPEN_SCIENCE_AZURE_AURORA_SKUS,
    get_open_science_sku_manifest,
)

__project__ = "Agriculture Atlas"
__domain__ = "https://agricultureatlas.org"
__chat_domain__ = "https://agricultureatlas.org/vi/chat"
__chat_domain_en__ = "https://agricultureatlas.org/en/chat"
__chat_domain_vi__ = "https://agricultureatlas.org/vi/chat"
__research_domain_en__ = "https://agricultureatlas.org/research"
__research_domain_vi__ = "https://agricultureatlas.org/vi/research"
__api_domain__ = "https://api.agricultureatlas.org"
__github_repo__ = "https://github.com/vantbhp/agricultureatlas"
__principal_investigator__ = "Van Le (Lê Thành Văn)"
__orcid__ = "https://orcid.org/0009-0005-3514-106X"
__compute_platform__ = "Microsoft Azure NVIDIA GPUs (A100/H100) & NVIDIA Brev"
__version__ = "1.0.0-vn-pilot"

__all__ = [
    "OPEN_SCIENCE_AZURE_AURORA_SKUS",
    "get_open_science_sku_manifest",
    "__project__",
    "__domain__",
    "__chat_domain__",
    "__chat_domain_en__",
    "__chat_domain_vi__",
    "__research_domain_en__",
    "__research_domain_vi__",
    "__api_domain__",
    "__github_repo__",
    "__principal_investigator__",
    "__orcid__",
    "__compute_platform__",
    "__version__",
]
