# PRD: Agriculture Atlas (`https://agricultureatlas.org`) — Phase 1: Vietnam Pilot
**Planetary Food Security & Zero-IoT Open-Science Reference Agronomic Atlas**
*(100% Non-Commercial Open Science | 100% Air-Gapped Boundary | UN SDG #2 Zero Hunger & SDG #13 Climate Action | 4-SKU MIT/Apache-2.0 Golden Stack on Microsoft Azure NVIDIA GPUs & NVIDIA Brev)*

---

## 1. Tầm Nhìn, Định Vị Pháp Lý & Kỷ Luật Air-Gapped (Locked Decisions)
- **Tên miền & Định danh Khoa học Mở chính thức:**
  - Cổng Khoa học Mở (Landing tĩnh Astro & Trung tâm Nghiên cứu): `https://agricultureatlas.org` (`EN` tại `/` & `/research` · `VI` tại `/vi/` & `/vi/research`)
  - Không gian Bản đồ H3 & Trợ lý Tham khảo: `https://agricultureatlas.org/en/chat` · `https://agricultureatlas.org/vi/chat`
  - Agro-Sensor & AI API Gateway: `https://api.agricultureatlas.org`
  - Kho mã nguồn mở (`Apache-2.0` code / `CC-BY-4.0` báo cáo & dữ liệu gốc): `https://github.com/vantbhp/agricultureatlas`
  - Chủ nhiệm Đề tài (`Principal Investigator`): `Van Le (Lê Thành Văn)` — Email: `van.le@agricultureatlas.org` | Khoa học Mở: `research@agricultureatlas.org` | Tài trợ: `grants@agricultureatlas.org` | Liên hệ: `hello@agricultureatlas.org` | ORCID iD: `https://orcid.org/0009-0005-3514-106X`
- **Định vị Pháp lý & Nguồn Dữ liệu Mở:** `100% Non-Commercial, Non-Profit Public Good` — Sử dụng nguồn dữ liệu quan sát Trái Đất và kiểm chứng khoa học mở theo đúng điều khoản riêng từng nguồn: **Microsoft Planetary Computer STAC** (`Copernicus Sentinel-1 SAR`, `Sentinel-2 L2A`, `Sentinel-3 SLSTR`, `NASA SMAP`, `DEM`), **Google Earth Engine** (`Approved Non-Commercial Research Access`), **Overture Maps** (`land_use` & `water`), và đối chiếu kiểm chứng hậu kiểm độc lập với **`ecmwf/aifs-ens-2.0`** (`CC-BY-4.0`) cùng **Google DeepMind WeatherNext** (`Approved Non-Commercial Research Access`).
- **Định vị sản phẩm (Locked Regulatory Positioning — Luật KTTV 2015 / Nghị định 38/2016):** Agriculture Atlas cung cấp **chỉ số nông học tham khảo** (`reference agronomic indices`), **không phải** bản tin dự báo, cảnh báo khí tượng thủy văn hay cảnh báo thiên tai chính thức (mọi đầu ra hướng về thời gian tới cần luật sư Việt Nam xác nhận phạm vi pháp lý trước khi kích hoạt công khai). Mọi nội dung hiển thị sử dụng ngôn ngữ *"chỉ số tham khảo về điều kiện…"* và tránh dùng từ ngữ mang tính dự báo/cảnh báo khí tượng chính thức.
- **Trạng thái mô hình & Hạ tầng Tính toán:** Giai đoạn v1.0 đã triển khai hoàn chỉnh bộ giải vật lý nông học xác định `FAO-56 Penman-Monteith`, 7 chỉ số tham khảo, gói tin Offline `< 5 KB` (`zlib` cấp độ 9) và API Gateway (tính từ đầu vào người dùng hoặc hồ sơ mẫu theo vùng); luồng dữ liệu vệ tinh trực tiếp và kiểm chuẩn huấn luyện 4-SKU Golden Stack được thiết kế trên **Microsoft Azure NVIDIA GPUs (`Standard_NC24ads_A100_v4`, `Standard_ND96isr_H100_v5`) & NVIDIA Brev** (`PyTorch + CUDA + TerraTorch + vLLM / TensorRT-LLM / NVIDIA ModelOpt NVFP4 & QAT/INT4`), đang chờ cấp phát compute grant (chưa công bố điểm đo neural chưa thực chạy).
- **Kỷ luật Độc lập Tuyệt đối (`100% Air-Gapped Open-Science Initiative`):**
  1. **Tách biệt 100% khỏi mọi dự án thương mại (`Zero Commercial Bleed`):** Xây dựng mới hoàn toàn từ đầu cho sứ mệnh khoa học mở công ích; tuyệt đối không kế thừa trọng số mô hình, không dùng chung mã nguồn, cơ sở dữ liệu hay tài nguyên/credit đám mây với bất kỳ dự án thương mại nào.
  2. **Cơ sở dữ liệu chuỗi thời gian `ClickHouse H3` chuyên biệt nông học:** Sử dụng `ReplacingMergeTree`, nén `DoubleDelta + ZSTD`, phân vùng `toYYYYMM(valid_time_utc)` và khóa nhân quả `model_init_time_utc <= valid_time_utc` để lưu 7 chỉ số cảm biến ảo trên từng ô `h3_res7` / `h3_res8`.
  3. **Không gian địa lý nông nghiệp `PostGIS + Overture Maps`:** Lọc chuyên sâu lớp sử dụng đất canh tác (`paddy`, `cropland`, `orchard`, `aquaculture`, `farmland`, `vineyard`) và mạng lưới thủy lợi `water` (kênh nội đồng, sông, hồ chứa, cửa sông).
  4. **Bảo vệ Chủ quyền Lãnh thổ Việt Nam 100%:** Khóa cứng mã quốc gia `country_code = 'VN'` và `sovereignty_verified = TRUE` trên toàn bộ lãnh thổ đất liền và hải đảo Việt Nam, bao gồm 100% chủ quyền **Quần đảo Hoàng Sa (Đà Nẵng)** và **Quần đảo Trường Sa (Khánh Hòa)**.

---

## 2. Phạm Vi Phase 1: Thí Điểm Việt Nam (5 Vùng Sinh Thái Nông Nghiệp Chuẩn Hóa)
Mã vùng đồng nhất 100% giữa `PRD.md`, `migrations/002_postgis_overture_agro_landuse_vn.sql`, `agro_physics_engine.py` và API Gateway:

1. **Vùng 1 — Đồng Bằng Sông Cửu Long (`VN_MKD`, H3 Res-7: `8765b566affffff` / Res-8: `8865b566a1fffff`):**
   - Cây trồng/vật nuôi chủ lực: Lúa 3 vụ (Đông Xuân, Hè Thu, Thu Đông), Sầu riêng Ri6/Monthong, Xoài Cát Hòa Lộc, Tôm nước lợ & Cá tra.
   - Chỉ số tham khảo trọng tâm: `salinity_risk_index` (chỉ số tham khảo điều kiện xâm nhập mặn cửa sông Tiền/Hậu, g/L), `leaf_wetness_hours` (số giờ ướt lá liên quan điều kiện bệnh đạo ôn/nấm), `soil_moisture_root_zone`.
2. **Vùng 2 — Tây Nguyên (`VN_CH`, H3 Res-7: `876590c9affffff` / Res-8: `886590c9a3fffff` — Đắk Lắk, Lâm Đồng, Gia Lai, Đắk Nông, Kon Tum):**
   - Cây trồng chủ lực: Cà phê Robusta/Arabica, Sầu riêng xuất khẩu, Hồ tiêu, Bơ sáp & Chè.
   - Chỉ số tham khảo trọng tâm: `et0_mm_day` (bốc thoát hơi nước tham chiếu mùa khô cho cà phê), `soil_moisture_root_zone` (`0–28 cm`), `leaf_wetness_hours` (điều kiện ẩm lá liên quan `Phytophthora`).
3. **Vùng 3 — Đồng Bằng Sông Hồng & Miền Núi Phía Bắc (`VN_RRD_NWM`, H3 Res-7: `87411c12affffff` / Res-8: `88411c12a5fffff`):**
   - Cây trồng chủ lực: Lúa Chiêm Xuân/Lúa Mùa, Rau vụ Đông, Mận Hậu, Đào & Chè Shan Tuyết.
   - Chỉ số tham khảo trọng tâm: `frost_risk_index` (chỉ số tham khảo về điều kiện nhiệt độ thấp/sương muối dưới `10°C`), `gdd_accumulated` (tổng tích ôn gắn với giai đoạn sinh trưởng lúa).
4. **Vùng 4 — Duyên Hải Miền Trung (`VN_CCC`, H3 Res-7: `87658244affffff` / Res-8: `88658244a7fffff`):**
   - Cây trồng chủ lực: Lúa ngắn ngày, Thanh long Bình Thuận, Nho & Táo Ninh Thuận, Tỏi Lý Sơn, Nuôi trồng thủy sản ven biển.
   - Chỉ số tham khảo trọng tâm: `et0_mm_day` (điều kiện khô nóng gió phơn), chỉ số tham khảo mặt nước từ `Sentinel-1 SAR` và `crop_stress_gravity_score`.
5. **Vùng 5 — Vùng Chủ Quyền Biển Đảo Đặc Biệt (`VN_HS_TS`, H3 Res-7: `8765f1a2affffff` / Res-8: `8865f1a2a9fffff` — Quần Đảo Hoàng Sa, Đà Nẵng & Quần Đảo Trường Sa, Khánh Hòa):**
   - Khóa cứng biên giới chủ quyền Việt Nam (`country_code = 'VN'`, `sovereignty_verified = TRUE`), theo dõi chỉ số tham khảo vi khí hậu biển đảo, lượng mưa, bức xạ, hơi muối và hỗ trợ canh tác rau xanh nhà màng/cây chịu mặn trên đảo.

---

## 3. Đội Hình 4-SKU "Golden Stack" (100% Lõi MIT / Apache-2.0 trên Azure NVIDIA GPUs & NVIDIA Brev)
- **Hạ tầng Huấn luyện & Suy luận:** **Microsoft Azure NVIDIA GPUs (`Standard_NC24ads_A100_v4`, `Standard_ND96isr_H100_v5`) & NVIDIA Brev** sử dụng `PyTorch + CUDA + TerraTorch + vLLM / TensorRT-LLM / NVIDIA ModelOpt (NVFP4 & QAT/INT4)`.
- **`AA-SKU-1` (`AgricultureAtlas-Climate-Aurora-Earth2`):** `microsoft/aurora` (`MIT`; `aurora-0.25-v1.5.ckpt`, `aurora-0.25-v1.5-ensemble.ckpt`, `aurora-0.1-finetuned.ckpt`, `aurora-0.25-wave.ckpt`, `aurora-0.4-air-pollution.ckpt`, `aurora-0.25-small-pretrained.ckpt`) + bộ giải vật lý xác định **FAO-56 Penman-Monteith** + `nvidia/cbottle` (`cBottle-SR`, `330M`, `Apache-2.0`, nâng độ phân giải quy mô km) + `nvidia/fourcastnet3` (`710.9M`, `Apache-2.0`, tổ hợp S2S 60 ngày). Đối chiếu hậu kiểm độc lập với `ecmwf/aifs-ens-2.0` (`CC-BY-4.0`) và Google DeepMind WeatherNext (`Approved Non-Commercial Research Access`). Đầu ra hướng tới nhiều tuần chỉ bật công khai sau khi hoàn tất thẩm định pháp lý Luật KTTV.
- **`AA-SKU-2` (`AgricultureAtlas-EO-TerraMind-THOR`):** `ibm-esa-geospatial/TerraMind-1.0-base` (`Apache-2.0`, đa phương thức 9 kênh: `S1 SAR` + `S2 L2A` + `DEM` + `LULC` + `NDVI` + `TerraMind-base-Flood`/`Fire`) + `FM4CS/THOR-1.0-base` (`Apache-2.0`, cảm biến nhiệt `Sentinel-3 SLSTR LST` + `S1/S2`, chạy trên `TerraTorch`); đối chiếu cùng baseline quang học `ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL` (`Apache-2.0`).
- **`AA-SKU-3` (`AgricultureAtlas-Agronomist-Qwen38-VN`):** `Qwen/Qwen3.8-27B` + `nvidia/Qwen3.8-27B-NVFP4` (`Apache-2.0`, `27.78B`, `NVIDIA ModelOpt NVFP4`) + `Qwen/Qwen3.6-35B-A3B` (`Apache-2.0`, `MoE` 3B active) + `Qwen/Qwen3-ASR-1.7B` (`Apache-2.0`, nhận dạng tiếng Việt đa vùng miền; đối chuẩn cùng `nvidia/nemotron-3.5-asr-streaming-0.6b` & `vinai/PhoWhisper-large`) + `pnnbao-ump/VieNeu-TTS-v3-Turbo` (`Apache-2.0`, `130.9M`, `48 kHz`, 23 giọng Bắc/Trung/Nam; dự phòng ASEAN: `openbmb/VoxCPM2` & `Zyphra/ZONOS3-Mini`).
- **`AA-SKU-4` (`AgricultureAtlas-Edge-Pocket`):** Kiến trúc biên 2 tầng chạy Offline 100% trên điện thoại Android `$50–$70` (`2–4 GB RAM`) kèm gói đồng bộ H3 `zlib` `< 5 KB`:
  - **Tier-0 (`2–4 GB RAM`, chống tràn bộ nhớ OOM):** `timm/mobilenetv4_conv_small.e2400_r224_in1k` (`3.8M`, `Apache-2.0`) + `pnnbao-ump/VieNeu-TTS-v3-Nano` (`48M ONNX`, `Apache-2.0`).
  - **Tier-1 (`Apache-2.0 Default`):** `google/gemma-4-E2B-it` (`litert-community/gemma-4-E2B-it-litert-lm`, `Apache-2.0`, `4 GB RAM`) & `Qwen/Qwen3.5-0.8B` (`Q4_0` `563 MB`, `Apache-2.0`, `2–3 GB RAM`) + `Qwen/Qwen3-ASR-0.6B-hf` (`Apache-2.0`).
  - *Baseline so sánh thử nghiệm (không thuộc lõi Apache-2.0):* `LiquidAI/LFM3-Omni-2B-GGUF` (`1.27 GB`, hỗ trợ `vi`, giấy phép `LFM Open License v1.0`).

---

## 4. Đặc Tả 4 Trạng Thái UI Bắt Buộc (`Loading`, `Empty`, `Error`, `Populated`)

### A. Giao diện Web Scientific Atlas (`https://agricultureatlas.org/vi/chat` & `/en/chat`)
Tuân thủ nghiêm ngặt chuẩn chữ giao diện sản phẩm khoa học tinh gọn (`<= 22px`, màu nhấn `#00F0FF` & `#10B981`, font monospace `11px–12px` cho chỉ số kỹ thuật):
1. **`Loading` State:** Hiển thị khung xương lưới lục giác `H3` đang đồng bộ dữ liệu mở `Planetary Computer STAC + GEE Non-Commercial + AA-SKU-1/2`, kèm tiến trình nạp phân vùng `ClickHouse H3`.
2. **`Empty` State:** Khi chọn một ô `H3` thuộc vùng lõi rừng đặc dụng hoặc mặt nước biển sâu chưa có diện tích canh tác `Overture Maps land_use`, hiển thị thông báo rõ ràng kèm nút **"Chuyển về Vùng Nông Nghiệp Trọng Điểm (`VN_MKD` / `VN_CH`)"**.
3. **`Error` State:** Khi mất kết nối luồng vệ tinh hoặc lỗi truy vấn API, hiển thị mã lỗi kỹ thuật minh bạch, thời điểm bản chụp `H3 Vintage` gần nhất đang dùng làm dữ liệu dự phòng, và nút **"Thử Lại Kết Nối Dữ Liệu"**.
4. **`Populated` State:** Hiển thị đầy đủ Bản đồ Lục giác `H3` Việt Nam (5 vùng `VN_MKD`, `VN_CH`, `VN_RRD_NWM`, `VN_CCC`, `VN_HS_TS` bao gồm Hoàng Sa & Trường Sa), 7 chỉ số tham khảo của Trạm Cảm Biến Ảo (`soil_moisture_root_zone`, `et0_mm_day`, `gdd_accumulated`, `salinity_risk_index`, `frost_risk_index`, `leaf_wetness_hours`, `crop_stress_gravity_score`), manifest 4-SKU Golden Stack và trình xuất gói tin Offline `< 5 KB`.

### B. Giao diện Mobile App Không Chữ (`Zero-Literacy Sensory UX`)
Thiết kế **"Không Chữ - Không Phím - Không Đăng Nhập" (`Zero-Text, Zero-Keyboard, Zero-Login`)**:
1. **`Loading` State (Đang Khóa Vệ Tinh GPS -> H3):** Vòng sóng radar xanh ngọc co giãn quanh biểu tượng vệ tinh + phát giọng nói tự động (`VieNeu-TTS-v3-Nano`): *"Cháu đang tìm vị trí ruộng của bác, bác chờ cháu một chút nhé!"*
2. **`Empty` State (Chưa Đứng Ngoài Ruộng / Chưa Cấp Quyền Vị Trí):** Hình vẽ bác nông dân chỉ tay ra cánh đồng + mũi tên lớn nhấp nháy + phát giọng nói: *"Bác bấm vào hình mũi tên xanh ở giữa để cháu biết ruộng mình ở đâu nhé!"*
3. **`Error` State (Mất Sóng 4G -> Tự Động Chuyển Chế Độ Đồng Ruộng Offline `AA-SKU-4`):** Biểu tượng đám mây gạch chéo chuyển sang biểu tượng Điện Thoại Có Khiên Xanh + phát giọng nói trấn an: *"Ngoài đồng đang mất mạng nhưng không sao đâu bác, máy của bác vẫn soi lá tham khảo và xem chỉ số đồng ruộng từ gói `< 5 KB` đã lưu sẵn!"*
4. **`Populated` State (Đèn Giao Thông Nông Vụ 3 Màu + 1 Nút Tròn Giữa Màn Hình):**
   - Nửa trên: Đèn Giao Thông 3 Màu (`🟢 Xanh #10B981`, `🟡 Vàng #F59E0B`, `🔴 Đỏ #EF4444`) kèm hình vẽ động (Cây lúa, Xô nước, Mặt trời, Bông tuyết, Sâu bệnh) và chế độ ngoài trời tương phản cao (`Outdoor Sun Mode`).
   - Chính giữa: 1 Nút Tròn Khổng Lồ (`🎙️ Chạm để Nói` + `📷 Giơ Camera Soi Lá/Đất`).
   - Nửa dưới: 3 Thẻ Hình Vẽ Hành Động (`[🪣 Tưới nước theo đốt ngón tay/xô 10L]`, `[🌾 Mùa vụ tham khảo]`, `[🔊 Nghe lại bản tin 5h30 sáng]`) hỗ trợ `Tap-to-Speak Everything`.
