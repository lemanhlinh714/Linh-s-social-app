from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

env_path = Path(__file__).resolve().parents[1] / ".env"
values = {}

if not env_path.is_file():
    raise SystemExit(f"Không tìm thấy file: {env_path}")

for raw_line in env_path.read_text(encoding="utf-8").splitlines():
    line = raw_line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue

    name, value = line.split("=", 1)
    values[name.strip()] = value.strip().strip("\"'")

url = values.get("EXPO_PUBLIC_SUPABASE_URL", "")
api_key = values.get("EXPO_PUBLIC_SUPABASE_ANON_KEY", "")

if not url or "<" in url or not api_key or "<" in api_key:
    raise SystemExit("Thiếu URL hoặc publishable key thật trong file .env")

parsed_url = urlparse(url)
if parsed_url.scheme != "https" or not parsed_url.netloc:
    raise SystemExit("Supabase URL không hợp lệ")

request = Request(
    f"{url.rstrip('/')}/rest/v1/app_users?select=did&limit=1",
    headers={"apikey": api_key, "Accept": "application/json"},
)

try:
    with urlopen(request, timeout=10) as response:
        print(f"Supabase kết nối được (HTTP {response.status}).")
except HTTPError as error:
    detail = error.read().decode("utf-8", errors="replace")
    raise SystemExit(f"Supabase trả HTTP {error.code}: {detail[:500]}")
except URLError as error:
    raise SystemExit(f"Không kết nối được tới Supabase: {error.reason}")