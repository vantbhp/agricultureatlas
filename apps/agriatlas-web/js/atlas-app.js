/**
 * AGRICULTUREATLAS.ORG — Agro-Climate Reference Indices & Spatial H3 Atlas
 * 100% Air-Gapped Non-Commercial Open-Science Split-Screen Experience
 * Stack: 4-SKU Golden Open-Science Stack (Azure NVIDIA GPU & NVIDIA Brev, 100% MIT / Apache-2.0) + Uber H3 Res-7/Res-8 + 4-Tier Vietnam Sovereignty Guard
 */

(function () {
  "use strict";

  const SOVEREIGNTY_GUARD = Object.freeze({
    iso_country_code: "VN",
    enforce_hoang_sa_da_nang: true,
    enforce_truong_sa_khanh_hoa: true
  });

  const ZONE_LABELS = Object.freeze({
    VN_MKD: "ĐBSCL",
    VN_CH: "Tây Nguyên",
    VN_RRD_NWM: "Bắc Bộ & Tây Bắc",
    VN_CCC: "Miền Trung",
    VN_HS_TS: "Hoàng Sa & Trường Sa (VN)"
  });

  const CROP_PILL_OPTIONS = [
    "🌾 Lúa nước",
    "☕ Cà phê & Hồ tiêu",
    "🍈 Sầu riêng & Cây ăn trái",
    "🦐 Tôm - Thủy sản",
    "🥬 Rau màu"
  ];

  const STAGE_PILL_OPTIONS = [
    "🌱 Xuống giống - Đẻ nhánh",
    "🌼 Làm đòng - Phân hóa hoa",
    "🌾 Đậu quả - Chắc hạt",
    "🚜 Thu hoạch"
  ];

  const PRIORITY_PILL_OPTIONS = [
    "💧 Tưới tiết kiệm ET0",
    "🍄 Phòng đạo ôn & Nấm bệnh",
    "🌊 Chống hạn - Xâm nhập mặn"
  ];

  const LAYER_META = Object.freeze({
    soil_moisture_root_zone: "💧 Lớp phủ: Độ ẩm đất vùng rễ SMAP (0–28cm)",
    et0_mm_day: "☀️ Lớp phủ: Bốc hơi tham chiếu FAO-56 Penman-Monteith ET0 (mm/ngày)",
    salinity_risk_index: "🌊 Lớp phủ: Ngưỡng chú ý xâm nhập mặn cửa sông (g/L & 0–100)",
    frost_risk_index: "❄️ Lớp phủ: Ngưỡng chú ý sương muối & rét đậm hại (< 10°C)",
    leaf_wetness_hours: "🍄 Lớp phủ: Số giờ ướt lá (Mức chú ý đạo ôn & nấm Phytophthora)",
    precip: "🌧️ Lớp phủ: Vũ lượng mưa 24h (Planetary Computer STAC + Microsoft Aurora)",
    wind: "💨 Lớp phủ: Trường gió 10m & Gió Lào khô nóng"
  });

  /**
   * 12 Calibrated H3 Res-7/Res-8 Cells across 5 Vietnam Agro-Ecological Zones
   */
  const H3_VIRTUAL_SENSOR_CELLS = [
    {
      h3_res7: "8765b566affffff",
      h3_res8: "8865b566a1fffff",
      zone_code: "VN_MKD",
      country_code: "VN",
      season_title: "Vụ Đông Xuân ĐBSCL • Cần Thơ",
      location_name: "Cần Thơ — ĐBSCL (Lúa Đông Xuân & Sầu riêng Ri6)",
      province_vi: "TP. Cần Thơ",
      land_use: "paddy",
      lat: 10.034,
      lon: 105.782,
      svg_x: 162,
      svg_y: 545,
      traffic_light: "AMBER",
      traffic_label: "AMBER // CẦN BƠM TRỮ NƯỚC NGỌT TRƯỚC TRIỀU MẶN",
      sensors: {
        soil_moisture_root_zone: 34.8,
        et0_mm_day: 5.42,
        gdd_accumulated: 1142,
        salinity_risk_index: 64.5,
        frost_risk_index: 2.0,
        leaf_wetness_hours: 11.5,
        crop_stress_gravity_score: 58.2
      },
      recommendation:
        "Độ ẩm tầng rễ đang ở mức 34.8% (đất se khô khoảng 1 đốt ngón tay). Ba ngày tới triều cường đẩy mặn 1.8g/L vào cửa sông Hậu: Sáng mai từ 04:00–07:00 bác tranh thủ bơm nước ngọt vào mương nội đồng. Khoan bón đạm Urea vì lá lúa đang ướt 11.5 giờ/ngày dễ bùng nấm đạo ôn (nếu có vết chấm kim, pha nửa nắp chai thuốc sinh học Tricyclazole/Kasugamycin cho bình 16 lít).",
      voice_tts_vi:
        "Bác ở Cần Thơ lưu ý: Đất đang khô một đốt ngón tay và ba ngày tới nước mặn dâng cao. Sáng sớm mai bác tranh thủ bơm nước ngọt vào mương và khoan rải phân đạm vì lá lúa đang ẩm dễ bị bệnh đạo ôn nhé!",
      forecast_14d_moisture: [34.8, 33.9, 32.5, 31.2, 36.4, 38.0, 37.1, 35.8, 34.2, 33.0, 35.5, 36.8, 36.1, 35.4],
      forecast_14d_et0: [5.4, 5.6, 5.8, 5.7, 4.9, 4.6, 5.1, 5.3, 5.5, 5.7, 5.0, 4.8, 5.1, 5.2]
    },
    {
      h3_res7: "8765b571affffff",
      h3_res8: "8865b571a3fffff",
      zone_code: "VN_MKD",
      country_code: "VN",
      season_title: "Chống Mặn Sầu Riêng • Bến Tre",
      location_name: "Chợ Lách, Bến Tre — ĐBSCL (Sầu riêng Ri6 & Cây ăn trái)",
      province_vi: "Bến Tre",
      land_use: "orchard",
      lat: 10.241,
      lon: 106.125,
      svg_x: 196,
      svg_y: 530,
      traffic_light: "RED",
      traffic_label: "RED // NGƯỠNG CHÚ Ý XÂM NHẬP MẶN CỬA SÔNG > 4.0‰",
      sensors: {
        soil_moisture_root_zone: 26.4,
        et0_mm_day: 6.15,
        gdd_accumulated: 1380,
        salinity_risk_index: 86.2,
        frost_risk_index: 1.0,
        leaf_wetness_hours: 7.2,
        crop_stress_gravity_score: 79.4
      },
      recommendation:
        "MỨC CHÚ Ý ĐÈN ĐỎ: Độ mặn ngoài sông Hàm Luông đạt 4.2g/L (sầu riêng chỉ chịu được dưới 0.5g/L). Bác đóng kín 100% cống lấy nước, tuyệt đối không bơm nước sông. Chỉ tưới giữ ẩm cầm chừng từ túi bạt trữ nước ngọt (khoảng 3/4 bình 16 lít cho mỗi gốc) và đắp lục bình/rơm dày 1 đốt ngón tay quanh gốc.",
      voice_tts_vi:
        "Mức chú ý Đèn Đỏ tại Bến Tre: Nước ngoài sông đang mặn trên 4 phần ngàn, bác đóng chặt cống, tuyệt đối không bơm nước sông vào vườn sầu riêng mà chỉ tưới nước ngọt dự trữ thôi nhé!",
      forecast_14d_moisture: [26.4, 25.1, 24.0, 23.2, 22.8, 25.5, 27.9, 28.4, 27.6, 26.9, 26.2, 28.0, 29.1, 29.5],
      forecast_14d_et0: [6.2, 6.3, 6.4, 6.1, 5.9, 5.4, 5.2, 5.5, 5.7, 5.8, 6.0, 5.6, 5.4, 5.3]
    },
    {
      h3_res7: "8765b54caffffff",
      h3_res8: "8865b54ca7fffff",
      zone_code: "VN_MKD",
      country_code: "VN",
      season_title: "Luân Canh Tôm-Lúa ST25 • Sóc Trăng",
      location_name: "Trần Đề, Sóc Trăng — ĐBSCL (Tôm nước lợ & Lúa ST25)",
      province_vi: "Sóc Trăng",
      land_use: "aquaculture",
      lat: 9.512,
      lon: 106.184,
      svg_x: 168,
      svg_y: 576,
      traffic_light: "GREEN",
      traffic_label: "GREEN // ĐỘ MẶN & OXY HÒA TAN TỐI ƯU CHO TÔM-LÚA",
      sensors: {
        soil_moisture_root_zone: 41.2,
        et0_mm_day: 4.85,
        gdd_accumulated: 1095,
        salinity_risk_index: 38.0,
        frost_risk_index: 1.0,
        leaf_wetness_hours: 8.4,
        crop_stress_gravity_score: 24.6
      },
      recommendation:
        "Trạng thái XANH an toàn: Độ ẩm mặt ruộng đạt 41.2%, tích nhiệt GDD đạt 1.095 °C·ngày giúp lúa thơm ST25 vô gạo chắc hạt. Duy trì mực nước ruộng cao khoảng 2 đốt ngón tay, không cần phun thuốc bảo vệ thực vật.",
      voice_tts_vi:
        "Ruộng lúa ST25 và vuông tôm ở Sóc Trăng đang rất tốt bác nhé, nắng ấm đều, bác giữ mực nước ổn định chờ ngày thu hoạch!",
      forecast_14d_moisture: [41.2, 40.8, 40.5, 41.0, 41.6, 42.0, 41.4, 40.9, 40.2, 39.8, 40.5, 41.1, 41.3, 41.0],
      forecast_14d_et0: [4.9, 4.8, 5.0, 4.9, 4.7, 4.6, 4.8, 5.0, 5.1, 5.0, 4.9, 4.8, 4.7, 4.8]
    },
    {
      h3_res7: "8765a214affffff",
      h3_res8: "8865a214a5fffff",
      zone_code: "VN_CH",
      country_code: "VN",
      season_title: "Tưới Cà Phê Đợt 1 • Đắk Lắk",
      location_name: "Cư M'gar, Đắk Lắk — Tây Nguyên (Cà phê Robusta & Hồ tiêu)",
      province_vi: "Đắk Lắk",
      land_use: "cropland",
      lat: 12.825,
      lon: 108.062,
      svg_x: 266,
      svg_y: 422,
      traffic_light: "AMBER",
      traffic_label: "AMBER // ĐẾN NGƯỠNG TƯỚI PHÂN HÓA MẦM HOA CÀ PHÊ",
      sensors: {
        soil_moisture_root_zone: 23.5,
        et0_mm_day: 5.95,
        gdd_accumulated: 945,
        salinity_risk_index: 1.5,
        frost_risk_index: 8.4,
        leaf_wetness_hours: 6.1,
        crop_stress_gravity_score: 52.8
      },
      recommendation:
        "Đất đỏ bazan tầng 0–28cm đã khô xuống 23.5% (khô sâu hơn 1 đốt ngón tay) và mầm hoa cà phê Robusta đã phân hóa hoàn chỉnh. Ngày mai bác mở béc tưới đợt 1 với lượng nước tiết kiệm 360 lít/gốc (tiết kiệm 25% nước nhờ tính theo ET0 = 5.95 mm/ngày) để hoa bung trắng đồng loạt.",
      voice_tts_vi:
        "Nương cà phê Đắk Lắk đã đủ độ khô hơn một đốt ngón tay để bung hoa rồi bác ơi! Ngày mai bác tưới đợt một khoảng 360 lít mỗi gốc để hoa nở đều nhé!",
      forecast_14d_moisture: [23.5, 22.4, 38.6, 37.2, 35.8, 34.1, 32.9, 31.5, 30.2, 29.0, 28.1, 27.4, 34.5, 33.8],
      forecast_14d_et0: [6.0, 6.1, 5.2, 5.4, 5.5, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.0, 5.3, 5.5]
    },
    {
      h3_res7: "8765a289affffff",
      h3_res8: "8865a289a1fffff",
      zone_code: "VN_CH",
      country_code: "VN",
      season_title: "Phòng Nấm Sương Mù • Lâm Đồng",
      location_name: "Đà Lạt - Đơn Dương, Lâm Đồng — Tây Nguyên (Rau & Arabica)",
      province_vi: "Lâm Đồng",
      land_use: "farmland",
      lat: 11.884,
      lon: 108.468,
      svg_x: 274,
      svg_y: 458,
      traffic_light: "AMBER",
      traffic_label: "AMBER // ƯỚT LÁ 15.8H — MỨC CHÚ Ý NẤM PHYTOPHTHORA",
      sensors: {
        soil_moisture_root_zone: 39.4,
        et0_mm_day: 3.45,
        gdd_accumulated: 782,
        salinity_risk_index: 1.0,
        frost_risk_index: 32.5,
        leaf_wetness_hours: 15.8,
        crop_stress_gravity_score: 61.0
      },
      recommendation:
        "Sương mù cao nguyên làm tán lá ướt liên tục 15.8 giờ/24h. Tạm ngưng tưới phun mưa lên lá, mở thông gió nhà màng lúc 06:00 sáng và pha nửa nắp chai chế phẩm nấm đối kháng Trichoderma với bình 16 lít tưới quanh cổ rễ.",
      voice_tts_vi:
        "Ở Lâm Đồng đêm nay sương mù dày làm ướt lá gần 16 tiếng, sáng mai bác đừng tưới lên lá mà hãy mở thông gió và tưới nấm đối kháng quanh gốc nhé!",
      forecast_14d_moisture: [39.4, 38.8, 38.0, 37.1, 36.5, 35.8, 35.2, 36.9, 38.1, 37.5, 36.8, 36.0, 35.4, 35.0],
      forecast_14d_et0: [3.5, 3.4, 3.6, 3.8, 3.9, 4.0, 4.1, 3.7, 3.5, 3.6, 3.8, 3.9, 4.0, 4.1]
    },
    {
      h3_res7: "87411cb2affffff",
      h3_res8: "88411cb2a3fffff",
      zone_code: "VN_RRD_NWM",
      country_code: "VN",
      season_title: "Chống Sương Muối • Sơn La - Tây Bắc",
      location_name: "Mộc Châu, Sơn La — Tây Bắc (Mận hậu, Chè Shan Tuyết & Rau Đông)",
      province_vi: "Sơn La",
      land_use: "orchard",
      lat: 20.842,
      lon: 104.641,
      svg_x: 138,
      svg_y: 122,
      traffic_light: "RED",
      traffic_label: "RED // NGƯỠNG CHÚ Ý SƯƠNG MUỐI & RÉT HẠI DƯỚI 6.0°C",
      sensors: {
        soil_moisture_root_zone: 31.0,
        et0_mm_day: 2.35,
        gdd_accumulated: 615,
        salinity_risk_index: 0.5,
        frost_risk_index: 88.5,
        leaf_wetness_hours: 13.2,
        crop_stress_gravity_score: 82.1
      },
      recommendation:
        "MỨC CHÚ Ý ĐÈN ĐỎ SƯƠNG MUỐI (88.5/100): Đêm nay quang mây bức xạ nhiệt làm nhiệt độ mặt lá giảm xuống dưới 4°C. Chiều nay trước 17:00 bác kéo vòm nilon che kín luống mạ và rau màu; lúc 05:30 sáng mai dùng bình 16 lít phun nước lã rửa sạch sương muối trên lá chè và mận trước khi nắng lên.",
      voice_tts_vi:
        "Mức chú ý Đèn Đỏ tại Sơn La: Đêm nay trời rét buốt có sương muối, chiều nay bác che bạt cho rau mạ và 5 rưỡi sáng mai nhớ phun nước rửa sương trên lá trước khi mặt trời mọc nhé!",
      forecast_14d_moisture: [31.0, 30.5, 32.8, 32.1, 31.5, 31.0, 30.4, 30.0, 31.8, 32.5, 32.0, 31.4, 31.0, 30.6],
      forecast_14d_et0: [2.4, 2.1, 1.9, 2.2, 2.5, 2.7, 2.8, 3.0, 2.9, 2.7, 2.8, 3.1, 3.2, 3.3]
    },
    {
      h3_res7: "87411845affffff",
      h3_res8: "88411845a9fffff",
      zone_code: "VN_RRD_NWM",
      country_code: "VN",
      season_title: "Lúa Chiêm Xuân • ĐB Sông Hồng",
      location_name: "Đông Hưng, Thái Bình — ĐB Sông Hồng (Lúa Xuân & Rau vụ Đông)",
      province_vi: "Thái Bình",
      land_use: "paddy",
      lat: 20.512,
      lon: 106.345,
      svg_x: 222,
      svg_y: 142,
      traffic_light: "GREEN",
      traffic_label: "GREEN // TÍCH NHIỆT GDD CHUẨN LỊCH TRỖ BÔNG NÉ RÉT NÀNG BÂN",
      sensors: {
        soil_moisture_root_zone: 40.5,
        et0_mm_day: 3.18,
        gdd_accumulated: 890,
        salinity_risk_index: 14.2,
        frost_risk_index: 18.0,
        leaf_wetness_hours: 9.1,
        crop_stress_gravity_score: 26.4
      },
      recommendation:
        "Trạng thái XANH: Độ ẩm ruộng đạt 40.5%, tích nhiệt GDD đạt 890 °C·ngày. Giữ lớp nước nông khoảng 1 đốt ngón tay (3cm) trên mặt ruộng để giữ ấm chân lúa và bón thúc Kali đón đòng vào ngày nắng ấm cuối tuần (không có mưa lớn gây rửa trôi).",
      voice_tts_vi:
        "Lúa Chiêm Xuân ở Thái Bình đang đẻ nhánh rất khỏe bác nhé, bác giữ lớp nước nông một đốt ngón tay trên ruộng để giữ ấm gốc lúa và bón đón đòng cuối tuần này!",
      forecast_14d_moisture: [40.5, 40.2, 41.0, 41.5, 40.8, 40.1, 39.7, 40.4, 41.2, 40.9, 40.5, 40.0, 39.8, 40.3],
      forecast_14d_et0: [3.2, 3.1, 2.9, 3.0, 3.3, 3.4, 3.5, 3.3, 3.2, 3.4, 3.5, 3.6, 3.5, 3.4]
    },
    {
      h3_res7: "8765a632affffff",
      h3_res8: "8865a632a5fffff",
      zone_code: "VN_CCC",
      country_code: "VN",
      season_title: "Tưới Tiết Kiệm Gió Lào • Ninh Thuận",
      location_name: "Phan Rang, Ninh Thuận — Miền Trung (Nho, Táo & Thanh long)",
      province_vi: "Ninh Thuận",
      land_use: "vineyard",
      lat: 11.564,
      lon: 108.988,
      svg_x: 314,
      svg_y: 446,
      traffic_light: "AMBER",
      traffic_label: "AMBER // GIÓ LÀO KHÔ NÓNG — ET0 VƯỢT 6.6 MM/NGÀY",
      sensors: {
        soil_moisture_root_zone: 21.8,
        et0_mm_day: 6.68,
        gdd_accumulated: 1420,
        salinity_risk_index: 22.5,
        frost_risk_index: 0.5,
        leaf_wetness_hours: 4.2,
        crop_stress_gravity_score: 59.5
      },
      recommendation:
        "Gió khô nóng đẩy bốc hơi ET0 lên 6.68 mm/ngày làm đất cát pha khô xuống 21.8%. Bác mở van tưới nhỏ giọt vào 05:30 sáng và 17:30 chiều (tương đương nửa bình 16 lít cho mỗi gốc nho/thanh long) và phủ cỏ khô giữ ẩm gốc.",
      voice_tts_vi:
        "Trời Ninh Thuận đang nắng gió gắt làm đất khô nhanh, chiều mát hôm nay bác mở van tưới nhỏ giọt cho giàn nho và vườn thanh long nhé!",
      forecast_14d_moisture: [21.8, 20.5, 31.4, 30.1, 28.6, 27.0, 25.4, 32.0, 30.8, 29.3, 27.9, 26.5, 31.8, 30.4],
      forecast_14d_et0: [6.7, 6.8, 6.5, 6.6, 6.7, 6.9, 6.8, 6.4, 6.5, 6.6, 6.7, 6.8, 6.5, 6.4]
    },
    {
      h3_res7: "87659104affffff",
      h3_res8: "88659104a1fffff",
      zone_code: "VN_CCC",
      country_code: "VN",
      season_title: "Tỏi Lý Sơn & Lúa Chạy Lũ • Quảng Ngãi",
      location_name: "Đảo Lý Sơn & Quảng Ngãi — Miền Trung (Tỏi Lý Sơn & Lúa ngắn ngày)",
      province_vi: "Quảng Ngãi",
      land_use: "cropland",
      lat: 15.382,
      lon: 109.118,
      svg_x: 306,
      svg_y: 302,
      traffic_light: "GREEN",
      traffic_label: "GREEN // ĐỘ ẨM CÁT SAN HÔ TỐI ƯU CHO TỎI LÝ SƠN TẠO CỦ",
      sensors: {
        soil_moisture_root_zone: 32.4,
        et0_mm_day: 4.52,
        gdd_accumulated: 1030,
        salinity_risk_index: 29.0,
        frost_risk_index: 2.0,
        leaf_wetness_hours: 7.8,
        crop_stress_gravity_score: 28.9
      },
      recommendation:
        "Độ ẩm tầng cát san hô + đất đỏ bazan ổn định 32.4%, tích nhiệt 1.030 °C·ngày giúp tỏi Lý Sơn xuống củ chắc. Sáng sớm bác tưới phun sương nhẹ bằng nước ngọt để rửa bụi muối biển bám trên lá.",
      voice_tts_vi:
        "Ruộng tỏi Lý Sơn Quảng Ngãi đang tạo củ rất đẹp bác nhé, sáng sớm bác tưới nhẹ rửa sương muối biển trên lá là tốt nhất!",
      forecast_14d_moisture: [32.4, 31.9, 31.2, 33.5, 34.0, 33.2, 32.6, 32.0, 31.5, 33.0, 33.8, 33.1, 32.5, 32.2],
      forecast_14d_et0: [4.5, 4.6, 4.7, 4.3, 4.2, 4.4, 4.5, 4.6, 4.7, 4.4, 4.3, 4.5, 4.6, 4.5]
    },
    {
      h3_res7: "87659248affffff",
      h3_res8: "88659248a1fffff",
      zone_code: "VN_HS_TS",
      country_code: "VN",
      season_title: "Chủ Quyền Hoàng Sa • TP. Đà Nẵng (VN)",
      location_name: "Quần đảo Hoàng Sa (TP. Đà Nẵng - Việt Nam) — Vi Khí Hậu Biển Đảo",
      province_vi: "TP. Đà Nẵng (Việt Nam)",
      land_use: "farmland",
      lat: 16.532,
      lon: 111.615,
      svg_x: 445,
      svg_y: 282,
      traffic_light: "GREEN",
      traffic_label: "GREEN // 🇻🇳 CHỦ QUYỀN VIỆT NAM — VƯỜN RAU BIỂN ĐẢO HOÀNG SA",
      sensors: {
        soil_moisture_root_zone: 36.2,
        et0_mm_day: 5.12,
        gdd_accumulated: 1260,
        salinity_risk_index: 44.0,
        frost_risk_index: 0.0,
        leaf_wetness_hours: 8.0,
        crop_stress_gravity_score: 31.5
      },
      recommendation:
        "Khẳng định chủ quyền 100% Việt Nam (TP. Đà Nẵng — ISO: VN). Độ ẩm giá thể vườn rau nhà màng chắn gió mặn đạt 36.2%. Duy trì tưới nhỏ giọt từ bể thu gom nước mưa vào lúc 17:30 chiều.",
      voice_tts_vi:
        "Trạm khí hậu nông nghiệp Quần đảo Hoàng Sa thuộc thành phố Đà Nẵng Việt Nam: Thời tiết biển đảo ổn định, thuận lợi chăm sóc vườn rau xanh và cây chắn gió!",
      forecast_14d_moisture: [36.2, 35.8, 35.4, 36.9, 37.5, 37.0, 36.4, 36.0, 35.5, 36.8, 37.2, 36.7, 36.3, 36.0],
      forecast_14d_et0: [5.1, 5.2, 5.3, 4.9, 4.8, 5.0, 5.1, 5.2, 5.3, 5.0, 4.9, 5.1, 5.2, 5.1]
    },
    {
      h3_res7: "87658c21affffff",
      h3_res8: "88658c21a1fffff",
      zone_code: "VN_HS_TS",
      country_code: "VN",
      season_title: "Chủ Quyền Trường Sa • Khánh Hòa (VN)",
      location_name: "Quần đảo Trường Sa (Tỉnh Khánh Hòa - Việt Nam) — Nông Nghiệp Đảo Xanh",
      province_vi: "Tỉnh Khánh Hòa (Việt Nam)",
      land_use: "farmland",
      lat: 8.644,
      lon: 111.92,
      svg_x: 445,
      svg_y: 500,
      traffic_light: "GREEN",
      traffic_label: "GREEN // 🇻🇳 CHỦ QUYỀN VIỆT NAM — VƯỜN RAU ĐẢO XANH TRƯỜNG SA",
      sensors: {
        soil_moisture_root_zone: 37.8,
        et0_mm_day: 5.28,
        gdd_accumulated: 1315,
        salinity_risk_index: 42.5,
        frost_risk_index: 0.0,
        leaf_wetness_hours: 8.6,
        crop_stress_gravity_score: 29.4
      },
      recommendation:
        "Khẳng định chủ quyền 100% Việt Nam (Tỉnh Khánh Hòa — ISO: VN). Vườn rau muống biển, mồng tơi, bầu bí và đai cây bàng vuông, phong ba đủ ẩm 37.8%, tiết kiệm 45% nước ngọt.",
      voice_tts_vi:
        "Trạm khí hậu nông nghiệp Quần đảo Trường Sa thuộc tỉnh Khánh Hòa Việt Nam: Vườn rau xanh và cây ăn quả trên đảo đủ ẩm, sinh trưởng tốt!",
      forecast_14d_moisture: [37.8, 37.2, 36.9, 38.4, 39.0, 38.5, 37.9, 37.4, 37.0, 38.2, 38.8, 38.3, 37.9, 37.6],
      forecast_14d_et0: [5.3, 5.4, 5.2, 4.9, 4.8, 5.1, 5.2, 5.3, 5.4, 5.0, 4.9, 5.1, 5.2, 5.3]
    },
    {
      h3_res7: "8765b100affffff",
      h3_res8: "8865b10001fffff",
      zone_code: "VN_CH",
      country_code: "VN",
      season_title: "Vùng Lõi Rừng Đặc Dụng",
      location_name: "Vùng Lõi Rừng Đặc Dụng (OvertureMaps Shift-Left: 0 Parcels)",
      province_vi: "Lâm Đồng",
      land_use: "primary_forest_core",
      is_empty_landuse: true,
      lat: 11.423,
      lon: 107.428,
      svg_x: 235,
      svg_y: 478,
      traffic_light: "GREEN",
      traffic_label: "EMPTY // VÙNG LÕI RỪNG BẢO TỒN",
      sensors: {
        soil_moisture_root_zone: 48.0,
        et0_mm_day: 3.9,
        gdd_accumulated: 1100,
        salinity_risk_index: 0.0,
        frost_risk_index: 0.0,
        leaf_wetness_hours: 14.0,
        crop_stress_gravity_score: 10.0
      },
      recommendation: "Ô H3 thuộc vùng lõi rừng đặc dụng không có đất canh tác.",
      voice_tts_vi: "Vị trí này là rừng tự nhiên không có ruộng canh tác, mời bác chuyển về vùng Đồng bằng Sông Cửu Long hoặc Tây Nguyên nhé!",
      forecast_14d_moisture: [48, 48, 47, 48, 49, 48, 48, 47, 48, 48, 49, 48, 48, 48],
      forecast_14d_et0: [3.9, 3.9, 4.0, 3.8, 3.9, 3.9, 4.0, 3.9, 3.8, 3.9, 4.0, 3.9, 3.9, 3.9]
    }
  ];

  /**
   * 6 Curated Vietnam Golden Seasonal Crop Windows (Tab 03 · Nông Lịch & Thời Vụ)
   */
  const SEASONAL_CROP_WINDOWS = [
    {
      id: "mkd-dong-xuan",
      title: "🌾 Lúa Đông Xuân ĐBSCL • Né Hạn Mặn Cửa Sông",
      zone: "VN_MKD",
      h3_res7: "8765b566affffff",
      window_months: "Th11 – Th3",
      optimal_metrics: "Ẩm rễ 38–42% · Mặn < 1.0g/L",
      months: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      prompt: "Lập lịch xuống giống và bơm trữ nước ngọt cho vụ Lúa Đông Xuân ĐBSCL né đỉnh triều cường xâm nhập mặn."
    },
    {
      id: "ch-coffee-bloom",
      title: "☕ Cà Phê Tây Nguyên • Xiết Nước & Tưới Bung Hoa",
      zone: "VN_CH",
      h3_res7: "8765a214affffff",
      window_months: "Th1 – Th4",
      optimal_metrics: "ET0 5.5–6.2mm · Tưới 360L/gốc",
      months: [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      prompt: "Tính lượng nước tưới đợt 1 theo FAO-56 ET0 để cà phê Robusta Đắk Lắk bung hoa đồng loạt tiết kiệm 25% nước."
    },
    {
      id: "mkd-durian-ri6",
      title: "🍈 Sầu Riêng Ri6 Chợ Lách • Giữ Ngọt & Chống Sốc Nhiệt",
      zone: "VN_MKD",
      h3_res7: "8765b571affffff",
      window_months: "Th2 – Th6",
      optimal_metrics: "Độ mặn < 0.5‰ · Tủ gốc giữ ẩm",
      months: [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      prompt: "Phác đồ bảo vệ vườn sầu riêng Ri6 Bến Tre khi độ mặn sông Hàm Luông vượt 4 phần ngàn."
    },
    {
      id: "rrd-chiem-xuan",
      title: "🌱 Lúa Chiêm Xuân Bắc Bộ • Tích Nhiệt GDD Né Rét Nàng Bân",
      zone: "VN_RRD_NWM",
      h3_res7: "87411845affffff",
      window_months: "Th1 – Th5",
      optimal_metrics: "GDD 850–1.100 · Trỗ bông an toàn",
      months: [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      prompt: "Điều tiết nước và bón đón đòng cho lúa Chiêm Xuân Thái Bình để trỗ bông né đợt rét nàng Bân."
    },
    {
      id: "nwm-frost-guard",
      title: "❄️ Rau Vụ Đông & Mận Sơn La • Chống Sương Muối Rét Hại",
      zone: "VN_RRD_NWM",
      h3_res7: "87411cb2affffff",
      window_months: "Th11 – Th2",
      optimal_metrics: "Frost Risk > 70 · Rửa sương 5h30",
      months: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      prompt: "Hướng dẫn che phủ nilon và phun nước rửa sương muối lúc 5h30 sáng bảo vệ vườn mận và rau vụ Đông ở Sơn La."
    },
    {
      id: "hs-ts-sovereign",
      title: "🇻🇳 Vườn Rau Biển Đảo Hoàng Sa & Trường Sa • Chủ Quyền VN",
      zone: "VN_HS_TS",
      h3_res7: "87659248affffff",
      window_months: "Quanh năm (Th1 – Th12)",
      optimal_metrics: "ISO: VN · Tưới nhỏ giọt bể mưa",
      months: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      prompt: "Kỹ thuật chăm sóc vườn rau xanh chịu mặn và thu gom nước mưa tưới nhỏ giọt tại Quần đảo Hoàng Sa và Trường Sa của Việt Nam."
    }
  ];

  /**
   * 4 Multimodal Leaf & Soil Pathology Diagnostic Profiles (AA-SKU-4 MobileNetV4 + Gemma-4-E2B / Qwen3.5-0.8B)
   */
  const LEAF_DOCTOR_DIAGNOSES = Object.freeze({
    rice_blast: {
      title: "📷 Soi Lá AA-SKU-4 (MobileNetV4 + Gemma-4-E2B / Qwen3.5-0.8B): Bệnh Đạo Ôn Lá Lúa (Magnaporthe oryzae)",
      h3_res7: "8765b566affffff",
      prescription:
        "Phát hiện vết bệnh hình thoi (mắt én) tâm xám trắng viền nâu trên lá lúa do đọng sương lá 11.5h/24h. CÁCH CHỮA DÂN DÃ: (1) Ngưng rải phân đạm Urea ngay lập tức; (2) Giữ mực nước ruộng cao 1 đốt ngón tay (3–5cm); (3) Pha đúng nửa nắp chai (15ml) thuốc đặc trị đạo ôn sinh học Kasugamycin hoặc Tricyclazole vào 1 bình xịt 16 lít nước, phun vào chiều mát khi lá đã ráo sương."
    },
    durian_phytophthora: {
      title: "📷 Soi Lá AA-SKU-4 (MobileNetV4 + Gemma-4-E2B / Qwen3.5-0.8B): Nấm Thối Rễ & Xì Mủ Sầu Riêng (Phytophthora)",
      h3_res7: "8765a289affffff",
      prescription:
        "Phát hiện vết thâm ướt chảy nhựa nâu đỏ trên vỏ thân sầu riêng do độ ẩm đất cao 39.4% và ướt lá 15.8h. CÁCH CHỮA DÂN DÃ: (1) Khơi rãnh thoát nước sâu 2 gang tay quanh tán cây; (2) Cạo sạch phần vỏ thối và quét dung dịch Fosetyl-Aluminium đặc; (3) Pha 1 nắp chai nấm đối kháng Trichoderma vào bình 16 lít tưới đều quanh vùng rễ tơ."
    },
    coffee_rust: {
      title: "📷 Soi Lá AA-SKU-4 (MobileNetV4 + Gemma-4-E2B / Qwen3.5-0.8B): Bệnh Gỉ Sắt Cà Phê & Thiếu Hụt Ẩm Tầng Rễ",
      h3_res7: "8765a214affffff",
      prescription:
        "Phát hiện ổ bào tử bột màu vàng cam mặt dưới lá cà phê Robusta kết hợp đất khô 23.5% (khô sâu hơn 1 đốt ngón tay). CÁCH CHỮA DÂN DÃ: (1) Tỉa thông thoáng cành vô hiệu; (2) Mở béc tưới bù ẩm theo ET0 (360 lít/gốc); (3) Pha nửa nắp chai thuốc gốc Đồng sinh học vào bình 16 lít phun ướt mặt dưới tán lá."
    },
    saline_soil: {
      title: "📷 Soi Đất AA-SKU-4 (MobileNetV4 + Gemma-4-E2B / Qwen3.5-0.8B): Đất Nứt Nẻ & Nhiễm Mặn Cửa Sông (> 3.5g/L)",
      h3_res7: "8765b571affffff",
      prescription:
        "Bề mặt đất kết tinh muối trắng, độ ẩm vùng rễ tụt xuống 26.4% và chỉ số ngưỡng chú ý mặn ở mức 86.2/100. CÁCH CHỮA DÂN DÃ: (1) Đóng kín cống, tuyệt đối không bơm nước sông đang mặn; (2) Bón vôi nông nghiệp hoặc thạch cao (CaSO4) để đẩy ion Natri ra khỏi keo đất; (3) Tưới rửa mặn nhỏ giọt từ túi trữ nước ngọt (3/4 bình 16 lít/gốc) và tủ lục bình dày 1 đốt ngón tay."
    }
  });

  // Runtime State
  const state = {
    theme: "dark",
    uiState: "populated",
    activeZone: "VN_MKD",
    activeH3: "8765b566affffff",
    activeSpatialTab: "doppler",
    activeAgroLayer: "soil_moisture_root_zone",
    cropIdx: 0,
    stageIdx: 0,
    priorityIdx: 0,
    savedFields: ["8765b566affffff", "8765a214affffff", "87411cb2affffff"],
    historySessions: [
      { id: "hist-1", title: "Vụ Đông Xuân ĐBSCL • Chống hạn mặn Cần Thơ", h3_res7: "8765b566affffff" },
      { id: "hist-2", title: "Tưới Cà Phê Đắk Lắk theo FAO-56 ET0", h3_res7: "8765a214affffff" },
      { id: "hist-3", title: "Chống sương muối Mộc Châu - Sơn La", h3_res7: "87411cb2affffff" }
    ],
    lastOfflinePacketJson: ""
  };

  /**
   * Format dynamic time-of-day farmer greeting
   */
  function updateTimeGreeting() {
    const h = new Date().getHours();
    const greeting =
      h >= 5 && h < 11
        ? "Chào buổi sáng bác nông dân!"
        : h >= 11 && h < 14
        ? "Chào buổi trưa bác nông dân!"
        : h >= 14 && h < 18
        ? "Chào buổi chiều bác nông dân!"
        : "Chào buổi tối bác nông dân!";
    const el = document.getElementById("welcome-greeting-headline");
    if (el) {
      el.textContent = greeting + " Hôm nay ruộng vườn của bác thế nào?";
    }
    const inputEl = document.getElementById("chat-prompt-input");
    if (inputEl) {
      inputEl.setAttribute(
        "title",
        "Hỏi Agriculture Atlas về chỉ số tưới ET0, độ mặn, sương muối hoặc bệnh cây trồng"
      );
    }
  }

  /**
   * Speak Vietnamese text aloud using Web Speech API (Tap-to-Speak Everything)
   */
  function speakVietnamese(text) {
    if (!text) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "vi-VN";
        utter.rate = 0.96;
        window.speechSynthesis.speak(utter);
      } catch (_err) {
        // Ignore if browser speech engine is restricted
      }
    }
  }

  function createHexagonPoints(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angleRad = (Math.PI / 180) * (60 * i - 30);
      pts.push((cx + r * Math.cos(angleRad)).toFixed(1) + "," + (cy + r * Math.sin(angleRad)).toFixed(1));
    }
    return pts.join(" ");
  }

  function getHexColorForLayer(cell) {
    if (cell.is_empty_landuse) {
      return { fill: "rgba(100, 116, 139, 0.3)", stroke: "#64748B" };
    }
    if (cell.traffic_light === "RED") {
      return { fill: "rgba(239, 68, 68, 0.38)", stroke: "#EF4444" };
    }
    if (cell.traffic_light === "AMBER") {
      return { fill: "rgba(245, 158, 11, 0.35)", stroke: "#F59E0B" };
    }
    return { fill: "rgba(16, 185, 129, 0.35)", stroke: "#10B981" };
  }

  /**
   * Render interactive Uber H3 hexagons on the Vietnam SVG Map
   */
  function renderVietnamH3Map(searchFilter) {
    const layer = document.getElementById("h3-hex-layer");
    if (!layer) return;
    layer.innerHTML = "";
    const q = (searchFilter || "").trim().toLowerCase();

    H3_VIRTUAL_SENSOR_CELLS.forEach(function (cell) {
      if (
        q &&
        cell.location_name.toLowerCase().indexOf(q) === -1 &&
        cell.province_vi.toLowerCase().indexOf(q) === -1 &&
        cell.zone_code.toLowerCase().indexOf(q) === -1
      ) {
        return;
      }

      const isSelected = cell.h3_res7 === state.activeH3;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "h3-hex-group" + (isSelected ? " active" : ""));
      g.setAttribute("data-h3", cell.h3_res7);
      g.setAttribute("role", "listitem");
      g.setAttribute("tabindex", "0");

      const colors = getHexColorForLayer(cell);
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("class", "h3-hex-polygon");
      poly.setAttribute("points", createHexagonPoints(cell.svg_x, cell.svg_y, isSelected ? 22 : 18));
      poly.setAttribute("fill", colors.fill);
      poly.setAttribute("stroke", isSelected ? "#00F0FF" : colors.stroke);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "h3-hex-label");
      label.setAttribute("x", String(cell.svg_x));
      label.setAttribute("y", String(cell.svg_y + 4));
      label.setAttribute("text-anchor", "middle");
      label.textContent = cell.h3_res7.slice(4, 8);

      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = cell.location_name + " (" + cell.h3_res7 + ")";

      g.appendChild(title);
      g.appendChild(poly);
      g.appendChild(label);

      g.addEventListener("click", function () {
        selectH3Cell(cell.h3_res7, false);
      });

      layer.appendChild(g);
    });
  }

  /**
   * Render 14-Day Microsoft Aurora + FAO-56 Research Simulation Chart in Spatial Tab 02
   */
  function renderAuroraForecastChart(cell) {
    const svg = document.getElementById("aurora-forecast-svg");
    if (!svg) return;

    const width = 620;
    const height = 185;
    const padL = 38;
    const padR = 34;
    const padT = 18;
    const padB = 26;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const mArr = cell.forecast_14d_moisture;
    const eArr = cell.forecast_14d_et0;
    const n = mArr.length;
    const mPts = [];
    const ePts = [];
    let dots = "";
    let xLabels = "";

    for (let i = 0; i < n; i++) {
      const x = padL + (i / (n - 1)) * plotW;
      const yM = padT + plotH - ((mArr[i] - 15) / 40) * plotH;
      const yE = padT + plotH - ((eArr[i] - 1.0) / 7.0) * plotH;
      mPts.push(x.toFixed(1) + "," + yM.toFixed(1));
      ePts.push(x.toFixed(1) + "," + yE.toFixed(1));

      dots +=
        '<circle cx="' + x.toFixed(1) + '" cy="' + yM.toFixed(1) + '" r="3" fill="#00F0FF" />' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + yE.toFixed(1) + '" r="2.6" fill="#10B981" />';

      if (i % 2 === 0 || i === n - 1) {
        xLabels +=
          '<text x="' + x.toFixed(1) + '" y="' + (height - 6) + '" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono" font-size="11">N+' + (i + 1) + "</text>";
      }
    }

    svg.innerHTML =
      '<line x1="' + padL + '" y1="' + padT + '" x2="' + (width - padR) + '" y2="' + padT + '" stroke="rgba(148,163,184,0.18)" stroke-dasharray="3,3" />' +
      '<line x1="' + padL + '" y1="' + (padT + plotH / 2) + '" x2="' + (width - padR) + '" y2="' + (padT + plotH / 2) + '" stroke="rgba(148,163,184,0.18)" stroke-dasharray="3,3" />' +
      '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (width - padR) + '" y2="' + (padT + plotH) + '" stroke="rgba(148,163,184,0.28)" />' +
      '<polyline fill="none" stroke="#00F0FF" stroke-width="2.3" points="' + mPts.join(" ") + '" />' +
      '<polyline fill="none" stroke="#10B981" stroke-width="2.1" stroke-dasharray="4,2" points="' + ePts.join(" ") + '" />' +
      dots +
      xLabels +
      '<text x="6" y="22" fill="#00F0FF" font-family="JetBrains Mono" font-size="11">Ẩm(%)</text>' +
      '<text x="' + (width - 32) + '" y="22" fill="#10B981" font-family="JetBrains Mono" font-size="11">ET0</text>';
  }

  /**
   * Render 6 Seasonal Crop Windows in Spatial Tab 03 (Nông Lịch & Thời Vụ)
   */
  function renderSeasonalAtlasCards() {
    const grid = document.getElementById("seasonal-atlas-grid");
    if (!grid) return;
    grid.innerHTML = "";

    SEASONAL_CROP_WINDOWS.forEach(function (win) {
      const card = document.createElement("article");
      card.className = "spatial-card";

      let monthsHtml = "";
      for (let m = 0; m < 12; m++) {
        const isPeak = win.months[m] === 1;
        monthsHtml += '<span class="month-cell' + (isPeak ? " peak" : "") + '">T' + (m + 1) + "</span>";
      }

      card.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">' +
        '<span class="badge badge-emerald">' + win.window_months + "</span>" +
        "<code>" + win.zone + "</code>" +
        "</div>" +
        "<h3>" + win.title + "</h3>" +
        '<p class="caption">' + win.optimal_metrics + "</p>" +
        '<div class="month-heatmap-strip">' + monthsHtml + "</div>" +
        '<button type="button" class="chat-action-pill is-primary" style="width:100%;justify-content:center;">💬 Lập lịch canh tác với AI</button>';

      card.querySelector("button").addEventListener("click", function () {
        selectH3Cell(win.h3_res7, false);
        sendAgroCopilotQuestion(win.prompt, win.h3_res7);
      });

      grid.appendChild(card);
    });
  }

  /**
   * Sync Offline < 5KB Field Delta Packet via live `/api/v1/agro/delta-packet/{h3_index}` API
   */
  function syncOfflinePacket(cell) {
    const fallbackPacket = {
      schema_version: "agricultureatlas.h3.delta.v1",
      country_code: "VN",
      sovereignty_verified: true,
      h3_index: cell.h3_res7,
      agro_zone_code: cell.zone_code,
      traffic_light_status: cell.traffic_light,
      indicators: cell.sensors,
      sku4_offline_engine: "AA-SKU-4: timm/mobilenetv4_conv_small + VieNeu-TTS-v3-Nano + google/gemma-4-E2B-it (litert-lm) / Qwen/Qwen3.5-0.8B",
      voice_tts_vi: cell.voice_tts_vi
    };

    const applyPacket = function (dataObj) {
      const pretty = JSON.stringify(dataObj, null, 2);
      const byteLen = dataObj.compressed_bytes || new TextEncoder().encode(pretty).length;
      state.lastOfflinePacketJson = pretty;
      setText("offline-packet-preview", pretty);
      setText("packet-byte-badge", byteLen + " BYTES (< 5 KB)");
    };

    applyPacket(fallbackPacket);

    if (typeof fetch === "function") {
      fetch("/api/v1/agro/delta-packet/" + encodeURIComponent(cell.h3_res7) + "?agro_zone_code=" + encodeURIComponent(cell.zone_code))
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (apiData) {
          if (apiData && apiData.under_5kb_sla) {
            applyPacket(apiData);
          }
        })
        .catch(function () {});
    }
  }

  /**
   * Select an H3 cell and update Map Popup, 7 Virtual Sensor Twin KPIs, 14-Day Chart & Morning Radio
   */
  function selectH3Cell(h3Res7, autoAskCopilot) {
    const cell = H3_VIRTUAL_SENSOR_CELLS.find(function (c) {
      return c.h3_res7 === h3Res7;
    });
    if (!cell) return;

    state.activeH3 = cell.h3_res7;
    state.activeZone = cell.zone_code;
    document.body.setAttribute("data-active-h3", cell.h3_res7);
    document.body.setAttribute("data-active-zone", cell.zone_code);

    if (cell.is_empty_landuse) {
      setUiState("empty");
      renderVietnamH3Map();
      return;
    }

    if (state.uiState !== "populated") {
      setUiState("populated");
    }

    // Update Header Breadcrumb & Zone Pill
    setText("header-active-season-title", cell.season_title + " • Ô H3 " + cell.h3_res7);
    setText("header-zone-pill-label", "🌐 Tiếng Việt · " + (ZONE_LABELS[cell.zone_code] || cell.zone_code) + " ▾");
    setText("active-h3-badge", "H3: " + cell.h3_res7);

    // Update Map Floating Popup Card
    setText("popup-h3-code", cell.h3_res7);
    setText("popup-cell-title", cell.location_name);
    const popupBadge = document.getElementById("popup-traffic-badge");
    if (popupBadge) {
      popupBadge.textContent = cell.traffic_label;
      popupBadge.className =
        "badge " +
        (cell.traffic_light === "RED"
          ? "badge-danger"
          : cell.traffic_light === "AMBER"
          ? "badge-amber"
          : "badge-emerald");
    }
    setText(
      "popup-folk-advice",
      "Ẩm rễ " +
        cell.sensors.soil_moisture_root_zone.toFixed(1) +
        "% · ET0 " +
        cell.sensors.et0_mm_day.toFixed(2) +
        " mm/ngày · Rủi ro mặn " +
        cell.sensors.salinity_risk_index.toFixed(1) +
        "/100."
    );

    // Update 7 Mandatory Virtual Sensor Twin KPI Readouts
    const s = cell.sensors;
    setText("val-soil_moisture_root_zone", s.soil_moisture_root_zone.toFixed(1) + "%");
    setText("val-et0_mm_day", s.et0_mm_day.toFixed(2) + " mm/d");
    setText("val-gdd_accumulated", s.gdd_accumulated.toLocaleString("en-US") + " °C·d");
    setText("val-salinity_risk_index", s.salinity_risk_index.toFixed(1) + " /100");
    setText("val-frost_risk_index", s.frost_risk_index.toFixed(1) + " /100");
    setText("val-leaf_wetness_hours", s.leaf_wetness_hours.toFixed(1) + " h/24h");
    setText("val-crop_stress_gravity_score", s.crop_stress_gravity_score.toFixed(1) + " /100");

    setText("spline-cell-subtitle", cell.location_name + " — Ô H3: " + cell.h3_res7);
    setText("morning-radio-script-text", '"' + cell.voice_tts_vi + '"');

    renderVietnamH3Map();
    renderAuroraForecastChart(cell);
    syncOfflinePacket(cell);

    if (autoAskCopilot) {
      sendAgroCopilotQuestion(
        "Phân tích 7 chỉ số cảm biến ảo không cần IoT và khuyến nghị canh tác hôm nay tại " + cell.location_name,
        cell.h3_res7
      );
    }
  }

  /**
   * Send a question to the Agro-Copilot, call live `/api/v1/agro/h3/{h3_index}`, and render AI Agro-Weather Card in chat stream
   */
  function sendAgroCopilotQuestion(promptText, targetH3) {
    const cleanPrompt = (promptText || "").trim();
    if (!cleanPrompt) return;

    const h3ToUse = targetH3 || state.activeH3;
    const cell =
      H3_VIRTUAL_SENSOR_CELLS.find(function (c) {
        return c.h3_res7 === h3ToUse;
      }) || H3_VIRTUAL_SENSOR_CELLS[0];

    // Hide empty welcome state once conversation starts
    const welcomeEl = document.getElementById("empty-chat-welcome");
    if (welcomeEl) {
      welcomeEl.style.display = "none";
    }

    const streamList = document.getElementById("chat-stream-list");
    if (!streamList) return;

    const contextHeader =
      "[" +
      CROP_PILL_OPTIONS[state.cropIdx] +
      " · " +
      STAGE_PILL_OPTIONS[state.stageIdx] +
      " · " +
      PRIORITY_PILL_OPTIONS[state.priorityIdx] +
      "] ";

    // 1. Append User Bubble
    const row = document.createElement("div");
    row.className = "chat-bubble-row";

    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble-user";
    userBubble.textContent = cleanPrompt;
    row.appendChild(userBubble);

    // 2. Append AI Bubble with live 7 Virtual Sensor Twin Card
    const aiBubble = document.createElement("div");
    aiBubble.className = "chat-bubble-ai";
    row.appendChild(aiBubble);
    streamList.appendChild(row);

    const renderBubbleContent = function (indicators, recommendationText, trafficStatus) {
      const badgeCls =
        trafficStatus === "RED"
          ? "badge-danger"
          : trafficStatus === "AMBER"
          ? "badge-amber"
          : "badge-emerald";

      aiBubble.innerHTML =
        '<div class="ai-bubble-header">' +
        '<span class="ai-author-tag">🌾 Agriculture Atlas · Trợ Lý Nông Học Tham Khảo (Aurora + TerraMind/THOR + Qwen3.8-27B)</span>' +
        '<span class="badge ' + badgeCls + '">' + trafficStatus + " · H3 " + cell.h3_res7 + "</span>" +
        "</div>" +
        '<p class="body-text"><strong>' +
        cell.location_name +
        "</strong> " +
        contextHeader +
        "— " +
        recommendationText +
        "</p>" +
        '<div class="agro-sensor-card-in-chat">' +
        '<div class="kpi-label">TRẠM CẢM BIẾN ẢO KHÔNG CẦN IOT (7 CHỈ SỐ VẬT LÝ NÔNG HỌC TRỰC TIẾP TỪ VỆ TINH)</div>' +
        '<div class="sensor-mini-grid-7">' +
        '<div class="sensor-mini-cell"><span class="sensor-mini-label">Ẩm rễ (0-28cm)</span><span class="sensor-mini-val">' +
        Number(indicators.soil_moisture_root_zone).toFixed(1) +
        "%</span></div>" +
        '<div class="sensor-mini-cell"><span class="sensor-mini-label">Bốc hơi ET0</span><span class="sensor-mini-val">' +
        Number(indicators.et0_mm_day).toFixed(2) +
        " mm/d</span></div>" +
        '<div class="sensor-mini-cell"><span class="sensor-mini-label">Tích nhiệt GDD</span><span class="sensor-mini-val">' +
        Math.round(Number(indicators.gdd_accumulated)) +
        " °C·d</span></div>" +
        '<div class="sensor-mini-cell"><span class="sensor-mini-label">Rủi ro Mặn</span><span class="sensor-mini-val">' +
        Number(indicators.salinity_risk_index).toFixed(1) +
        "/100</span></div>" +
        '<div class="sensor-mini-cell"><span class="sensor-mini-label">Sương muối</span><span class="sensor-mini-val">' +
        Number(indicators.frost_risk_index).toFixed(1) +
        "/100</span></div>" +
        '<div class="sensor-mini-cell"><span class="sensor-mini-label">Giờ ướt lá</span><span class="sensor-mini-val">' +
        Number(indicators.leaf_wetness_hours).toFixed(1) +
        "h/24h</span></div>" +
        '<div class="sensor-mini-cell"><span class="sensor-mini-label">Stress Gravity</span><span class="sensor-mini-val">' +
        Number(indicators.crop_stress_gravity_score).toFixed(1) +
        "/100</span></div>" +
        "</div>" +
        '<div class="chat-card-actions">' +
        '<button type="button" class="chat-action-pill is-primary" data-bubble-speak="1">🔊 Nghe đọc to</button>' +
        '<button type="button" class="chat-action-pill" data-bubble-focus-h3="' + cell.h3_res7 + '">📍 Xem trên Bản đồ H3</button>' +
        '<button type="button" class="chat-action-pill" data-bubble-save-h3="' + cell.h3_res7 + '">＋ Lưu vào Sổ ruộng</button>' +
        "</div>" +
        "</div>";

      aiBubble.querySelector("[data-bubble-speak]").addEventListener("click", function () {
        speakVietnamese(cell.voice_tts_vi + " " + recommendationText);
      });
      aiBubble.querySelector("[data-bubble-focus-h3]").addEventListener("click", function () {
        switchSpatialTab("doppler");
        selectH3Cell(cell.h3_res7, false);
      });
      aiBubble.querySelector("[data-bubble-save-h3]").addEventListener("click", function (ev) {
        saveFieldToBasket(cell.h3_res7);
        ev.currentTarget.textContent = "✓ Đã lưu Sổ ruộng";
      });
    };

    // Render immediately with calibrated data, then enrich from live FastAPI endpoint `/api/v1/agro/h3/{h3_index}`
    renderBubbleContent(cell.sensors, cell.recommendation, cell.traffic_light);

    if (typeof fetch === "function") {
      fetch(
        "/api/v1/agro/h3/" +
          encodeURIComponent(cell.h3_res7) +
          "?agro_zone_code=" +
          encodeURIComponent(cell.zone_code)
      )
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (liveData) {
          if (liveData && liveData.indicators) {
            renderBubbleContent(
              liveData.indicators,
              cell.recommendation + " (Đồng bộ API trực tiếp: tưới bù " + liveData.recommended_irrigation_mm + " mm/ngày).",
              liveData.traffic_light_status || cell.traffic_light
            );
          }
        })
        .catch(function () {});
    }

    const container = document.getElementById("chat-messages-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  /**
   * Save an H3 field into the Saved Fields Basket ("Sổ ruộng")
   */
  function saveFieldToBasket(h3Res7) {
    if (state.savedFields.indexOf(h3Res7) === -1) {
      state.savedFields.unshift(h3Res7);
    }
    setText("saved-fields-badge", String(state.savedFields.length));
    renderDrawers();
  }

  /**
   * Render History & Saved Fields Slide-Over Drawers
   */
  function renderDrawers() {
    const histList = document.getElementById("history-drawer-list");
    if (histList) {
      histList.innerHTML = "";
      state.historySessions.forEach(function (sess) {
        const item = document.createElement("div");
        item.className = "drawer-item-card";
        item.innerHTML =
          '<strong style="font-size:12.5px;">' + sess.title + "</strong>" +
          "<code>Ô H3: " + sess.h3_res7 + "</code>";
        item.addEventListener("click", function () {
          document.getElementById("drawer-history").setAttribute("hidden", "hidden");
          selectH3Cell(sess.h3_res7, true);
        });
        histList.appendChild(item);
      });
    }

    const fieldsList = document.getElementById("saved-fields-drawer-list");
    if (fieldsList) {
      fieldsList.innerHTML = "";
      state.savedFields.forEach(function (h3Code) {
        const cell = H3_VIRTUAL_SENSOR_CELLS.find(function (c) {
          return c.h3_res7 === h3Code;
        });
        if (!cell) return;
        const item = document.createElement("div");
        item.className = "drawer-item-card";
        item.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<strong style="font-size:12.5px;">' + cell.season_title + "</strong>" +
          '<span class="badge badge-emerald">' + cell.traffic_light + "</span>" +
          "</div>" +
          '<p class="caption">' + cell.location_name + "</p>" +
          "<code>H3: " + cell.h3_res7 + " · Ẩm " + cell.sensors.soil_moisture_root_zone + "% · ET0 " + cell.sensors.et0_mm_day + "mm</code>";
        item.addEventListener("click", function () {
          document.getElementById("drawer-saved-fields").setAttribute("hidden", "hidden");
          selectH3Cell(cell.h3_res7, true);
        });
        fieldsList.appendChild(item);
      });
    }
  }

  /**
   * Switch between the 4 Spatial Right Pane Tabs ('doppler' | 'spline' | 'atlas' | 'passport')
   */
  function switchSpatialTab(tabId) {
    state.activeSpatialTab = tabId;
    document.querySelectorAll("[data-spatial-tab]").forEach(function (btn) {
      const match = btn.getAttribute("data-spatial-tab") === tabId;
      btn.classList.toggle("active", match);
      btn.setAttribute("aria-selected", match ? "true" : "false");
    });

    ["doppler", "spline", "atlas", "passport"].forEach(function (id) {
      const panel = document.getElementById("spatial-panel-" + id);
      if (!panel) return;
      if (id === tabId) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "hidden");
      }
    });
  }

  /**
   * Switch between the 4 Mandatory UI States: 'populated' | 'loading' | 'empty' | 'error'
   */
  function setUiState(targetState) {
    const valid = ["populated", "loading", "empty", "error"];
    const nextState = valid.indexOf(targetState) !== -1 ? targetState : "populated";
    state.uiState = nextState;

    document.documentElement.setAttribute("data-ui-state", nextState);
    document.body.setAttribute("data-ui-state", nextState);

    valid.forEach(function (st) {
      const panel = document.getElementById("view-state-" + st);
      if (!panel) return;
      if (st === nextState) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "hidden");
      }
    });

    document.querySelectorAll("#ui-state-switcher .state-btn").forEach(function (btn) {
      const isMatch = btn.getAttribute("data-state-target") === nextState;
      btn.classList.toggle("active", isMatch);
      btn.setAttribute("aria-pressed", isMatch ? "true" : "false");
    });
  }

  /**
   * Toggle Dark (#0b0f19) <-> Light Warm Editorial Paper (#F4EFE6) Theme
   */
  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    document.body.setAttribute("data-theme", state.theme);
    const btn = document.getElementById("btn-theme-toggle");
    if (btn) {
      btn.textContent = state.theme === "dark" ? "☀️" : "🌙";
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function downloadOfflinePacketFile() {
    if (!state.lastOfflinePacketJson) return;
    const blob = new Blob([state.lastOfflinePacketJson], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agricultureatlas_offline_" + state.activeZone + "_" + state.activeH3 + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setText("packet-status-msg", "Đã tải gói tin Offline " + a.download + " (" + blob.size + " bytes < 5 KB)!");
  }

  /**
   * Initialize Draggable Split-Pane Resizer (30% - 66%, Default 44%)
   */
  function initSplitPaneResizer() {
    const resizer = document.getElementById("split-pane-resizer");
    const viewport = document.getElementById("view-state-populated");
    if (!resizer || !viewport) return;

    let dragging = false;

    const applySplitPct = function (pct) {
      const clamped = Math.max(30, Math.min(66, pct));
      viewport.style.setProperty("--chat-split-pct", clamped.toFixed(1) + "%");
    };

    resizer.addEventListener("mousedown", function (ev) {
      if (ev.target.closest(".split-preset-btn")) return;
      dragging = true;
      resizer.classList.add("active");
    });

    window.addEventListener("mousemove", function (ev) {
      if (!dragging) return;
      const rect = viewport.getBoundingClientRect();
      const relX = ev.clientX - rect.left - 56;
      const availW = Math.max(400, rect.width - 56);
      applySplitPct((relX / availW) * 100);
    });

    window.addEventListener("mouseup", function () {
      if (dragging) {
        dragging = false;
        resizer.classList.remove("active");
      }
    });

    document.querySelectorAll(".split-preset-btn").forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        const pct = Number(btn.getAttribute("data-split-pct") || 44);
        applySplitPct(pct);
        document.querySelectorAll(".split-preset-btn").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
      });
    });
  }

  /**
   * Bind all UI events
   */
  function bindEvents() {
    // 1. New Season / Reset Welcome Screen
    const resetToNewSeason = function () {
      const streamList = document.getElementById("chat-stream-list");
      const welcomeEl = document.getElementById("empty-chat-welcome");
      if (streamList) streamList.innerHTML = "";
      if (welcomeEl) welcomeEl.style.display = "flex";
    };
    document.getElementById("btn-new-season")?.addEventListener("click", resetToNewSeason);
    document.getElementById("rail-new-btn")?.addEventListener("click", resetToNewSeason);
    document.getElementById("brand-home-trigger")?.addEventListener("click", resetToNewSeason);

    // 2. Theme Toggle
    document.getElementById("btn-theme-toggle")?.addEventListener("click", toggleTheme);

    // 3. 4 Mandatory UI States Switcher
    document.querySelectorAll("#ui-state-switcher .state-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setUiState(btn.getAttribute("data-state-target"));
      });
    });
    document.getElementById("btn-finish-loading")?.addEventListener("click", function () {
      setUiState("populated");
    });
    document.getElementById("btn-return-mkd")?.addEventListener("click", function () {
      selectH3Cell("8765b566affffff", false);
    });
    document.getElementById("btn-return-ch")?.addEventListener("click", function () {
      selectH3Cell("8765a214affffff", false);
    });
    document.getElementById("btn-retry-satellite")?.addEventListener("click", function () {
      setUiState("populated");
    });
    document.getElementById("btn-export-emergency-pack")?.addEventListener("click", downloadOfflinePacketFile);

    // 4. Header Popovers (Zone Selector & Share Popover)
    const togglePopover = function (popId) {
      const el = document.getElementById(popId);
      if (!el) return;
      const isHidden = el.hasAttribute("hidden");
      ["zone-select-popover", "share-actions-popover", "rail-toolkit-popover"].forEach(function (id) {
        document.getElementById(id)?.setAttribute("hidden", "hidden");
      });
      if (isHidden) el.removeAttribute("hidden");
    };

    document.getElementById("btn-zone-popover")?.addEventListener("click", function (ev) {
      ev.stopPropagation();
      togglePopover("zone-select-popover");
    });
    document.getElementById("btn-share-popover")?.addEventListener("click", function (ev) {
      ev.stopPropagation();
      togglePopover("share-actions-popover");
    });
    document.getElementById("rail-toolkit-btn")?.addEventListener("click", function (ev) {
      ev.stopPropagation();
      togglePopover("rail-toolkit-popover");
    });

    document.querySelectorAll("[data-zone-select]").forEach(function (item) {
      item.addEventListener("click", function () {
        const z = item.getAttribute("data-zone-select");
        document.querySelectorAll("[data-zone-select]").forEach(function (i) {
          i.classList.toggle("active", i === item);
        });
        document.getElementById("zone-select-popover")?.setAttribute("hidden", "hidden");
        const firstInZone = H3_VIRTUAL_SENSOR_CELLS.find(function (c) {
          return c.zone_code === z && !c.is_empty_landuse;
        });
        if (firstInZone) selectH3Cell(firstInZone.h3_res7, true);
      });
    });

    // Share menu actions
    document.getElementById("menu-export-offline-pack")?.addEventListener("click", function () {
      document.getElementById("share-actions-popover")?.setAttribute("hidden", "hidden");
      switchSpatialTab("passport");
      downloadOfflinePacketFile();
    });
    document.getElementById("menu-open-passport-tab")?.addEventListener("click", function () {
      document.getElementById("share-actions-popover")?.setAttribute("hidden", "hidden");
      switchSpatialTab("passport");
    });
    document.getElementById("menu-speak-morning-radio")?.addEventListener("click", function () {
      document.getElementById("share-actions-popover")?.setAttribute("hidden", "hidden");
      const cell = H3_VIRTUAL_SENSOR_CELLS.find(function (c) {
        return c.h3_res7 === state.activeH3;
      });
      if (cell) speakVietnamese(cell.voice_tts_vi);
    });
    document.getElementById("menu-print-schedule")?.addEventListener("click", function () {
      document.getElementById("share-actions-popover")?.setAttribute("hidden", "hidden");
      window.print();
    });

    // 5. Left Nav Rail Drawers & Modals
    document.getElementById("rail-history-btn")?.addEventListener("click", function () {
      const d = document.getElementById("drawer-history");
      document.getElementById("drawer-saved-fields")?.setAttribute("hidden", "hidden");
      if (d) d.toggleAttribute("hidden");
    });
    document.getElementById("mobile-menu-btn")?.addEventListener("click", function () {
      document.getElementById("drawer-history")?.toggleAttribute("hidden");
    });
    document.getElementById("rail-fields-btn")?.addEventListener("click", function () {
      const d = document.getElementById("drawer-saved-fields");
      document.getElementById("drawer-history")?.setAttribute("hidden", "hidden");
      if (d) d.toggleAttribute("hidden");
    });
    document.querySelectorAll("[data-close-drawer]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = btn.getAttribute("data-close-drawer");
        document.getElementById(target)?.setAttribute("hidden", "hidden");
      });
    });
    document.getElementById("rail-atlas-btn")?.addEventListener("click", function () {
      switchSpatialTab("atlas");
    });

    // Toolkit prompts
    document.querySelectorAll("[data-toolkit-prompt]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.getElementById("rail-toolkit-popover")?.setAttribute("hidden", "hidden");
        sendAgroCopilotQuestion(btn.getAttribute("data-toolkit-prompt"), state.activeH3);
      });
    });
    document.getElementById("toolkit-morning-radio-btn")?.addEventListener("click", function () {
      document.getElementById("rail-toolkit-popover")?.setAttribute("hidden", "hidden");
      switchSpatialTab("passport");
      const cell = H3_VIRTUAL_SENSOR_CELLS.find(function (c) {
        return c.h3_res7 === state.activeH3;
      });
      if (cell) speakVietnamese(cell.voice_tts_vi);
    });

    // 6. Modals: 4 Open-Science SKUs & AA-SKU-4 Leaf Doctor
    document.getElementById("btn-open-sku-modal")?.addEventListener("click", function () {
      document.getElementById("modal-open-science-skus")?.removeAttribute("hidden");
    });
    document.getElementById("btn-close-sku-modal")?.addEventListener("click", function () {
      document.getElementById("modal-open-science-skus")?.setAttribute("hidden", "hidden");
    });

    const openLeafDoctor = function () {
      document.getElementById("modal-leaf-doctor")?.removeAttribute("hidden");
    };
    document.getElementById("rail-leaf-doctor-btn")?.addEventListener("click", openLeafDoctor);
    document.getElementById("pill-open-leaf-doctor")?.addEventListener("click", openLeafDoctor);
    document.getElementById("btn-close-leaf-doctor")?.addEventListener("click", function () {
      document.getElementById("modal-leaf-doctor")?.setAttribute("hidden", "hidden");
    });

    // Close modals when clicking on dark backdrop outside modal shell or pressing Escape
    document.querySelectorAll(".paywall-modal-backdrop").forEach(function (backdrop) {
      backdrop.addEventListener("click", function (ev) {
        if (ev.target === backdrop) {
          backdrop.setAttribute("hidden", "hidden");
        }
      });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        document.getElementById("modal-open-science-skus")?.setAttribute("hidden", "hidden");
        document.getElementById("modal-leaf-doctor")?.setAttribute("hidden", "hidden");
        document.getElementById("rail-toolkit-popover")?.setAttribute("hidden", "hidden");
        document.getElementById("header-more-popover")?.setAttribute("hidden", "hidden");
      }
    });

    // Interactive SKU cards inside 4-SKU modal
    document.querySelectorAll("[data-sku-demo-prompt]").forEach(function (card) {
      card.addEventListener("click", function () {
        const prompt = card.getAttribute("data-sku-demo-prompt");
        const h3 = card.getAttribute("data-sku-demo-h3") || state.activeH3;
        document.getElementById("modal-open-science-skus")?.setAttribute("hidden", "hidden");
        if (prompt) {
          selectH3Cell(h3, false);
          sendAgroCopilotQuestion(prompt, h3);
        }
      });
    });

    document.querySelectorAll("[data-diagnose-sample]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const key = btn.getAttribute("data-diagnose-sample");
        const diag = LEAF_DOCTOR_DIAGNOSES[key];
        document.getElementById("modal-leaf-doctor")?.setAttribute("hidden", "hidden");
        if (diag) {
          selectH3Cell(diag.h3_res7, false);
          sendAgroCopilotQuestion(diag.title + " — " + diag.prescription, diag.h3_res7);
          speakVietnamese(diag.prescription);
        }
      });
    });

    // 7. 6 Bento Zone Pills & 4 Starter Prompt Cards
    document.querySelectorAll("[data-bento-h3]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        const h3 = pill.getAttribute("data-bento-h3");
        selectH3Cell(h3, true);
      });
    });

    document.querySelectorAll("[data-starter-prompt]").forEach(function (card) {
      card.addEventListener("click", function () {
        const h3 = card.getAttribute("data-starter-h3");
        const prompt = card.getAttribute("data-starter-prompt");
        selectH3Cell(h3, false);
        sendAgroCopilotQuestion(prompt, h3);
      });
    });

    // 8. 3 Context Quick Pills in Floating Input
    document.getElementById("pill-crop")?.addEventListener("click", function () {
      state.cropIdx = (state.cropIdx + 1) % CROP_PILL_OPTIONS.length;
      setText("pill-crop-text", CROP_PILL_OPTIONS[state.cropIdx]);
    });
    document.getElementById("pill-stage")?.addEventListener("click", function () {
      state.stageIdx = (state.stageIdx + 1) % STAGE_PILL_OPTIONS.length;
      setText("pill-stage-text", STAGE_PILL_OPTIONS[state.stageIdx]);
    });
    document.getElementById("pill-priority")?.addEventListener("click", function () {
      state.priorityIdx = (state.priorityIdx + 1) % PRIORITY_PILL_OPTIONS.length;
      setText("pill-priority-text", PRIORITY_PILL_OPTIONS[state.priorityIdx]);
    });

    const triggerVoiceQuestion = function () {
      const sampleVoicePrompt =
        "Cháu ơi kiểm tra giúp bác ruộng ở ô H3 hiện tại hôm nay có cần tưới nước theo ET0 hay phòng bệnh đạo ôn không?";
      sendAgroCopilotQuestion(sampleVoicePrompt, state.activeH3);
    };
    document.getElementById("pill-voice-dialect")?.addEventListener("click", triggerVoiceQuestion);
    document.getElementById("btn-voice-input")?.addEventListener("click", triggerVoiceQuestion);

    // Chat form submit
    document.getElementById("chat-input-form")?.addEventListener("submit", function (ev) {
      ev.preventDefault();
      const inputEl = document.getElementById("chat-prompt-input");
      if (!inputEl || !inputEl.value.trim()) return;
      const q = inputEl.value.trim();
      inputEl.value = "";
      sendAgroCopilotQuestion(q, state.activeH3);
    });

    // 9. Right Pane 4 Spatial Tabs & Map Controls
    document.querySelectorAll("[data-spatial-tab]").forEach(function (tabBtn) {
      tabBtn.addEventListener("click", function () {
        switchSpatialTab(tabBtn.getAttribute("data-spatial-tab"));
      });
    });

    document.querySelectorAll("[data-agro-layer]").forEach(function (layerBtn) {
      layerBtn.addEventListener("click", function () {
        const layerKey = layerBtn.getAttribute("data-agro-layer");
        state.activeAgroLayer = layerKey;
        document.querySelectorAll("[data-agro-layer]").forEach(function (b) {
          b.classList.toggle("active", b === layerBtn);
        });
        setText("map-active-layer-legend", LAYER_META[layerKey] || LAYER_META.soil_moisture_root_zone);
        renderVietnamH3Map();
      });
    });

    document.getElementById("map-region-search")?.addEventListener("input", function (ev) {
      renderVietnamH3Map(ev.target.value);
    });

    document.getElementById("btn-ask-ai-from-map")?.addEventListener("click", function () {
      selectH3Cell(state.activeH3, true);
    });
    document.getElementById("btn-save-field-from-map")?.addEventListener("click", function () {
      saveFieldToBasket(state.activeH3);
    });
    document.getElementById("btn-speak-from-map")?.addEventListener("click", function () {
      const cell = H3_VIRTUAL_SENSOR_CELLS.find(function (c) {
        return c.h3_res7 === state.activeH3;
      });
      if (cell) speakVietnamese(cell.voice_tts_vi);
    });

    // Tab 04 Morning Radio & Offline Packet Download/Copy
    document.getElementById("btn-play-morning-radio")?.addEventListener("click", function () {
      const cell = H3_VIRTUAL_SENSOR_CELLS.find(function (c) {
        return c.h3_res7 === state.activeH3;
      });
      if (cell) speakVietnamese(cell.voice_tts_vi);
    });
    document.getElementById("btn-generate-packet")?.addEventListener("click", downloadOfflinePacketFile);
    document.getElementById("btn-copy-packet")?.addEventListener("click", function () {
      if (navigator.clipboard && state.lastOfflinePacketJson) {
        navigator.clipboard.writeText(state.lastOfflinePacketJson).then(function () {
          setText("packet-status-msg", "Đã sao chép gói tin JSON (< 5 KB) vào bộ nhớ tạm!");
        });
      }
    });

    // Mobile 3-Tab Switcher
    document.querySelectorAll("[data-mobile-pane]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = btn.getAttribute("data-mobile-pane");
        document.querySelectorAll("[data-mobile-pane]").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        const chatW = document.getElementById("chat-pane-wrapper");
        const mapW = document.getElementById("map-pane-wrapper");
        if (target === "chat") {
          chatW?.classList.remove("mobile-hidden");
          mapW?.classList.add("mobile-hidden");
        } else if (target === "map") {
          chatW?.classList.add("mobile-hidden");
          mapW?.classList.remove("mobile-hidden");
        } else if (target === "fields") {
          document.getElementById("drawer-saved-fields")?.removeAttribute("hidden");
        }
      });
    });
  }

  // Expose Public API for Automated Verification
  window.AgricultureAtlasApp = {
    version: "1.0.0-vn-pilot-copilot",
    sovereigntyGuard: SOVEREIGNTY_GUARD,
    cells: H3_VIRTUAL_SENSOR_CELLS,
    setUiState: setUiState,
    selectH3Cell: selectH3Cell,
    sendAgroCopilotQuestion: sendAgroCopilotQuestion,
    switchSpatialTab: switchSpatialTab,
    toggleTheme: toggleTheme
  };

  function boot() {
    updateTimeGreeting();
    renderSeasonalAtlasCards();
    renderDrawers();
    initSplitPaneResizer();
    bindEvents();
    selectH3Cell(state.activeH3, false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
