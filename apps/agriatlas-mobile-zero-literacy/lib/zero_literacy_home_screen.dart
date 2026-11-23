import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// 4 Mandatory UI States for Zero-Literacy Sensory UX (Loading, Empty, Error, Populated)
enum ZeroLiteracyUiState {
  loading, // Loading: Đang Khóa Vệ Tinh GPS -> H3
  empty, // Empty: Chưa Đứng Ngoài Ruộng / Chưa Cấp Quyền Vị Trí
  error, // Error: Mất Sóng 4G -> Tự Động Chuyển Chế Độ Đồng Ruộng Offline AA-SKU-4 (MobileNetV4 + VieNeu-TTS-v3-Nano + Gemma-4-E2B / Qwen3.5-0.8B, ONNX/GGUF/LiteRT-LM Apache-2.0, < 5 KB H3 Delta)
  populated, // Populated: Đèn Giao Thông Nông Vụ 3 Màu + 1 Nút Tròn Giữa Màn Hình
}

/// 3-Color Traffic Light Status for Field Decision
enum AgroTrafficSignal {
  greenSafe, // #10B981 Xanh An Toàn
  yellowIrrigate, // #F59E0B Vàng Cần Tưới ET0
  redHazard, // #EF4444 Đỏ Mức Chú Ý Sương Muối / Xâm Nhập Mặn / Đạo Ôn
}

/// Dialect & Agro-Ecological Zone locked via GPS -> H3 Res-8 + OvertureMaps land_use
class H3FieldTelemetryPacket {
  final String h3Res8Index;
  final String regionCode;
  final String dialectName;
  final String landUseClass;
  final int packetSizeBytes;
  final double soilMoistureRootZone;
  final double et0MmDay;
  final double gddAccumulated;
  final double salinityRiskIndex;
  final double frostRiskIndex;
  final double leafWetnessHours;
  final double cropStressGravityScore;
  final AgroTrafficSignal signal;
  final String spokenTrafficPrompt;
  final String spokenWaterBucketPrompt;
  final String spokenSeedSchedulePrompt;
  final String spokenMorningRadioPrompt;
  final String spokenLeafDoctorPrompt;

  const H3FieldTelemetryPacket({
    required this.h3Res8Index,
    required this.regionCode,
    required this.dialectName,
    required this.landUseClass,
    required this.packetSizeBytes,
    required this.soilMoistureRootZone,
    required this.et0MmDay,
    required this.gddAccumulated,
    required this.salinityRiskIndex,
    required this.frostRiskIndex,
    required this.leafWetnessHours,
    required this.cropStressGravityScore,
    required this.signal,
    required this.spokenTrafficPrompt,
    required this.spokenWaterBucketPrompt,
    required this.spokenSeedSchedulePrompt,
    required this.spokenMorningRadioPrompt,
    required this.spokenLeafDoctorPrompt,
  });

  bool get isUnderFiveKilobytes => packetSizeBytes < 5120;
}

/// Callback signature for TTS / Audio guidance playback
typedef VoiceGuidanceSynthesizer = Future<void> Function(
  String utterance, {
  required String dialect,
});

/// Zero-Literacy Sensory UX Home Screen ("Không Chữ - Không Phím - Không Đăng Nhập")
/// Enforces Product UI Typography Ceiling: all TextStyle fontSize <= 22.0px
/// Colors: #00F0FF (Cyan Accent), #10B981 (Green), #F59E0B (Amber), #EF4444 (Red)
class ZeroLiteracyHomeScreen extends StatefulWidget {
  final ZeroLiteracyUiState initialState;
  final AgroTrafficSignal initialSignal;
  final bool initialOutdoorSunMode;
  final VoiceGuidanceSynthesizer? onSpeakGuidance;

  const ZeroLiteracyHomeScreen({
    super.key,
    this.initialState = ZeroLiteracyUiState.populated,
    this.initialSignal = AgroTrafficSignal.greenSafe,
    this.initialOutdoorSunMode = false,
    this.onSpeakGuidance,
  });

  @override
  State<ZeroLiteracyHomeScreen> createState() => _ZeroLiteracyHomeScreenState();
}

class _ZeroLiteracyHomeScreenState extends State<ZeroLiteracyHomeScreen>
    with SingleTickerProviderStateMixin {
  static const Color kCyanAccent = Color(0xFF00F0FF);
  static const Color kTrafficGreen = Color(0xFF10B981);
  static const Color kTrafficAmber = Color(0xFFF59E0B);
  static const Color kTrafficRed = Color(0xFFEF4444);
  static const Color kDarkBg = Color(0xFF070D14);
  static const Color kDarkSurface = Color(0xFF0F1924);
  static const Color kOutdoorSunBg = Color(0xFF000000);
  static const Color kOutdoorSunSurface = Color(0xFF09131C);

  late ZeroLiteracyUiState _uiState;
  late AgroTrafficSignal _trafficSignal;
  late bool _outdoorSunMode;
  bool _arCameraDoctorActive = false;
  String _lastSpokenTranscript = '';
  late final AnimationController _pulseController;

  static const Map<AgroTrafficSignal, H3FieldTelemetryPacket> _presetPackets = {
    AgroTrafficSignal.greenSafe: H3FieldTelemetryPacket(
      h3Res8Index: '8865b56623fffff',
      regionCode: 'VN-MKD',
      dialectName: 'Phương ngữ Miền Tây Nam Bộ',
      landUseClass: 'paddy_irrigated',
      packetSizeBytes: 3840,
      soilMoistureRootZone: 0.34,
      et0MmDay: 4.1,
      gddAccumulated: 1185.0,
      salinityRiskIndex: 0.8,
      frostRiskIndex: 0.0,
      leafWetnessHours: 3.5,
      cropStressGravityScore: 16.0,
      signal: AgroTrafficSignal.greenSafe,
      spokenTrafficPrompt:
          'Đèn Xanh an toàn bác ơi! Hôm nay đất ruộng đủ ẩm sâu một đốt ngón tay, nước kênh ngọt lành, bác cứ yên tâm nghỉ ngơi, chưa cần bơm nước hay phun thuốc đâu nghen!',
      spokenWaterBucketPrompt:
          'Xô Nước Tưới Hôm Nay: Đất gốc lúa đang ẩm tốt, bốc hơi nước bốn phẩy một ly. Hôm nay bác khóa cống, giữ mực nước ruộng sâu đúng một đốt ngón tay là vừa đẹp, chưa cần tưới thêm xô 10 lít đâu nhé!',
      spokenSeedSchedulePrompt:
          'Lịch Gieo Bón Hôm Nay: Trời nắng ấm thuận lợi, ngày mai lúc bảy giờ sáng bác rải phân đón đòng, pha thêm nửa nắp chai vi sinh cho mỗi bình đeo vai mười sáu lít nước nhé!',
      spokenMorningRadioPrompt:
          'Đài Phát Thanh Năm Giờ Rưỡi Sáng: Chào bà con Đồng Bằng Sông Cửu Long! Sáng nay gió nhẹ, nước ngọt về đầy kênh nội đồng, bà con thăm bờ bao và giữ nước ấm chân lúa.',
      spokenLeafDoctorPrompt:
          'Đã mở camera soi lá và đất rồi bác ơi, bác giơ sát vào lá cây giúp cháu nhé! Có vết đốm nào bác cứ nói cho cháu nghe!',
    ),
    AgroTrafficSignal.yellowIrrigate: H3FieldTelemetryPacket(
      h3Res8Index: '886592491bfffff',
      regionCode: 'VN-IBN',
      dialectName: 'Phương ngữ Tây Nguyên',
      landUseClass: 'orchard_coffee_durian',
      packetSizeBytes: 4120,
      soilMoistureRootZone: 0.19,
      et0MmDay: 5.8,
      gddAccumulated: 940.0,
      salinityRiskIndex: 0.1,
      frostRiskIndex: 0.05,
      leafWetnessHours: 2.0,
      cropStressGravityScore: 54.0,
      signal: AgroTrafficSignal.yellowIrrigate,
      spokenTrafficPrompt:
          'Đèn Vàng cần tưới nước bác ơi! Nắng gió Tây Nguyên làm bốc hơi gần sáu ly nước hôm nay, đất dưới rễ khô quá một đốt ngón tay rồi, chiều mát bác mở van tưới gốc nhé!',
      spokenWaterBucketPrompt:
          'Xô Nước Tưới Hôm Nay: Đất khô xuống sâu một gang tay rồi bác ạ! Đúng bốn giờ rưỡi chiều bác tưới khoảng hai xô 10 lít quanh tán cà phê và sầu riêng cho đất ẩm lại một đốt ngón tay nhé!',
      spokenSeedSchedulePrompt:
          'Lịch Gieo Bón Hôm Nay: Đang nắng gắt bác khoan bón phân hạt kẻo bốc hơi mất chất. Bác chờ tưới ẩm đất xong sáng mai hãy hòa nửa nắp chai dưỡng rễ vào bình đeo vai mười sáu lít!',
      spokenMorningRadioPrompt:
          'Đài Phát Thanh Năm Giờ Rưỡi Sáng: Bà con Tây Nguyên lưu ý hôm nay nắng hanh, độ ẩm rễ giảm nhanh, bà con ưu tiên tưới tiết kiệm dưới tán cây vào buổi chiều mát.',
      spokenLeafDoctorPrompt:
          'Đã mở camera soi lá và đất rồi bác ơi, bác giơ sát vào mặt dưới lá cà phê hoặc gốc sầu riêng giúp cháu kiểm tra rệp sáp và nấm hồng ngay tại vườn nhé!',
    ),
    AgroTrafficSignal.redHazard: H3FieldTelemetryPacket(
      h3Res8Index: '8865b56697fffff',
      regionCode: 'VN-MKD-RRD',
      dialectName: 'Phương ngữ Bắc Bộ & Nam Bộ',
      landUseClass: 'paddy_aquaculture',
      packetSizeBytes: 4480,
      soilMoistureRootZone: 0.28,
      et0MmDay: 3.4,
      gddAccumulated: 820.0,
      salinityRiskIndex: 4.6,
      frostRiskIndex: 0.88,
      leafWetnessHours: 11.5,
      cropStressGravityScore: 86.0,
      signal: AgroTrafficSignal.redHazard,
      spokenTrafficPrompt:
          'Mức chú ý Đèn Đỏ bác ơi! Ngoài kênh đang có nước mặn bốn phẩy sáu phần nghìn, lá lúa ướt sương dễ bùng bệnh đạo ôn và vùng núi có sương muối lạnh! Bác đóng kín cống lấy nước ngay nhé!',
      spokenWaterBucketPrompt:
          'Mức chú ý Đèn Đỏ về nước tưới: Nước ngoài sông đang nhiễm mặn nặng lắm bác ơi! Bác tuyệt đối không bơm nước ngoài kênh vào ruộng lúc này, chỉ dùng nước ngọt dự trữ khoảng một xô 10 lít mỗi gốc trong vườn thôi nhé!',
      spokenSeedSchedulePrompt:
          'Mức chú ý Đèn Đỏ về chăm sóc: Đêm nay sương ướt lá suốt mười một tiếng và trời trở lạnh, bác tuyệt đối không bón đạm! Chờ nắng lên bác pha nửa nắp chai thuốc sinh học trị đạo ôn vào bình đeo vai mười sáu lít nhé!',
      spokenMorningRadioPrompt:
          'Đài Phát Thanh Năm Giờ Rưỡi Sáng: Mức chú ý Đèn Đỏ về xâm nhập mặn cửa sông Tiền sông Hậu và rét đậm sương muối miền núi phía Bắc! Bà con đóng cống ngăn mặn và che ấm mạ ngay sáng nay!',
      spokenLeafDoctorPrompt:
          'Đã mở camera soi lá và đất rồi bác ơi, bác giơ sát vào chiếc lá có vết chấm kim hay hình mắt én giúp cháu xem mức độ đạo ôn ngay tại ruộng nhé!',
    ),
  };

  @override
  void initState() {
    super.initState();
    _uiState = widget.initialState;
    _trafficSignal = widget.initialSignal;
    _outdoorSunMode = widget.initialOutdoorSunMode;
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
    _announceStateVoice(_uiState);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  H3FieldTelemetryPacket get _activePacket =>
      _presetPackets[_trafficSignal] ??
      _presetPackets[AgroTrafficSignal.greenSafe]!;

  Future<void> _speak(String message) async {
    HapticFeedback.mediumImpact();
    setState(() {
      _lastSpokenTranscript = message;
    });
    if (widget.onSpeakGuidance != null) {
      await widget.onSpeakGuidance!(
        message,
        dialect: _activePacket.dialectName,
      );
    }
  }

  void _announceStateVoice(ZeroLiteracyUiState state) {
    switch (state) {
      case ZeroLiteracyUiState.loading:
        _lastSpokenTranscript =
            'Cháu đang tìm vị trí ruộng của bác, bác chờ cháu một chút nhé!';
        break;
      case ZeroLiteracyUiState.empty:
        _lastSpokenTranscript =
            'Bác bấm vào hình mũi tên xanh ở giữa để cháu biết ruộng mình ở đâu nhé!';
        break;
      case ZeroLiteracyUiState.error:
        _lastSpokenTranscript =
            'Ngoài đồng đang mất mạng nhưng không sao đâu bác, máy của bác vẫn soi lá bắt bệnh và xem lịch tưới bình thường!';
        break;
      case ZeroLiteracyUiState.populated:
        _lastSpokenTranscript = _activePacket.spokenTrafficPrompt;
        break;
    }
  }

  void _switchUiState(ZeroLiteracyUiState nextState) {
    setState(() {
      _uiState = nextState;
      _arCameraDoctorActive = false;
      _announceStateVoice(nextState);
    });
    _speak(_lastSpokenTranscript);
  }

  void _switchTrafficSignal(AgroTrafficSignal nextSignal) {
    setState(() {
      _trafficSignal = nextSignal;
      _uiState = ZeroLiteracyUiState.populated;
    });
    _speak(_activePacket.spokenTrafficPrompt);
  }

  Color _signalColor(AgroTrafficSignal signal) {
    switch (signal) {
      case AgroTrafficSignal.greenSafe:
        return kTrafficGreen;
      case AgroTrafficSignal.yellowIrrigate:
        return kTrafficAmber;
      case AgroTrafficSignal.redHazard:
        return kTrafficRed;
    }
  }

  @override
  Widget build(BuildContext context) {
    final Color bgColor = _outdoorSunMode ? kOutdoorSunBg : kDarkBg;
    final Color surfaceColor =
        _outdoorSunMode ? kOutdoorSunSurface : kDarkSurface;
    final double borderThickness = _outdoorSunMode ? 2.8 : 1.5;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildTopSensorAndModeHeader(surfaceColor, borderThickness),
            _buildDiagnosticStateSelectorBar(surfaceColor),
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 220),
                child: _buildBodyForState(surfaceColor, borderThickness),
              ),
            ),
            _buildVoiceFeedbackFooter(surfaceColor, borderThickness),
          ],
        ),
      ),
    );
  }

  /// Header: Auto GPS -> H3 Res-8 + OvertureMaps land_use + < 5KB Offline badge + Sun Mode toggle
  Widget _buildTopSensorAndModeHeader(
    Color surfaceColor,
    double borderThickness,
  ) {
    final packet = _activePacket;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
      decoration: BoxDecoration(
        color: surfaceColor,
        border: Border(
          bottom: BorderSide(
            color: kCyanAccent.withValues(alpha: _outdoorSunMode ? 0.95 : 0.45),
            width: borderThickness,
          ),
        ),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => _speak(
              'Đã khóa vị trí ruộng của bác rồi ạ, gói tin đồng ruộng siêu nhẹ, đang nói ${packet.dialectName} cho bác dễ nghe nhé!',
            ),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
              decoration: BoxDecoration(
                color: kCyanAccent.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(8.0),
                border: Border.all(color: kCyanAccent, width: 1.2),
              ),
              child: Text(
                'H3:${packet.h3Res8Index} • ${packet.landUseClass} • ${(packet.packetSizeBytes / 1024).toStringAsFixed(1)}KB (<5KB)',
                style: const TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: kCyanAccent,
                ),
              ),
            ),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () {
              setState(() {
                _outdoorSunMode = !_outdoorSunMode;
              });
              _speak(
                _outdoorSunMode
                    ? 'Đã bật chế độ Nắng Gắt Ngoài Đồng tương phản cực cao để bác nhìn rõ dưới trời nắng trưa!'
                    : 'Đã chuyển về chế độ màn hình dịu mắt buổi sáng sớm.',
              );
            },
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10.0, vertical: 5.0),
              decoration: BoxDecoration(
                color: _outdoorSunMode
                    ? kTrafficAmber.withValues(alpha: 0.25)
                    : surfaceColor,
                borderRadius: BorderRadius.circular(8.0),
                border: Border.all(
                  color: _outdoorSunMode ? kTrafficAmber : kCyanAccent,
                  width: borderThickness,
                ),
              ),
              child: Text(
                _outdoorSunMode ? '☀️ NẮNG GẮT: BẬT' : '☀️ NẮNG GẮT: TẮT',
                style: TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: _outdoorSunMode ? kTrafficAmber : Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// State & Traffic Signal Switcher Bar for 4 UI States (Loading, Empty, Error, Populated)
  Widget _buildDiagnosticStateSelectorBar(Color surfaceColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 6.0),
      color: surfaceColor.withValues(alpha: 0.8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildStateChip('Loading', ZeroLiteracyUiState.loading),
            const SizedBox(width: 6.0),
            _buildStateChip('Empty', ZeroLiteracyUiState.empty),
            const SizedBox(width: 6.0),
            _buildStateChip('Error (Offline AA-SKU-4)', ZeroLiteracyUiState.error),
            const SizedBox(width: 6.0),
            _buildStateChip('Populated', ZeroLiteracyUiState.populated),
            const SizedBox(width: 12.0),
            _buildSignalDotButton(
              'XANH',
              AgroTrafficSignal.greenSafe,
              kTrafficGreen,
            ),
            const SizedBox(width: 6.0),
            _buildSignalDotButton(
              'VÀNG',
              AgroTrafficSignal.yellowIrrigate,
              kTrafficAmber,
            ),
            const SizedBox(width: 6.0),
            _buildSignalDotButton(
              'ĐỎ',
              AgroTrafficSignal.redHazard,
              kTrafficRed,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStateChip(String label, ZeroLiteracyUiState targetState) {
    final bool selected = _uiState == targetState;
    return GestureDetector(
      onTap: () => _switchUiState(targetState),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
        decoration: BoxDecoration(
          color: selected
              ? kCyanAccent.withValues(alpha: 0.22)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(6.0),
          border: Border.all(
            color: selected ? kCyanAccent : Colors.white38,
            width: 1.0,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'JetBrains Mono',
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: selected ? kCyanAccent : Colors.white70,
          ),
        ),
      ),
    );
  }

  Widget _buildSignalDotButton(
    String label,
    AgroTrafficSignal signal,
    Color color,
  ) {
    final bool active =
        _uiState == ZeroLiteracyUiState.populated && _trafficSignal == signal;
    return GestureDetector(
      onTap: () => _switchTrafficSignal(signal),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
        decoration: BoxDecoration(
          color: active ? color.withValues(alpha: 0.28) : Colors.transparent,
          borderRadius: BorderRadius.circular(6.0),
          border: Border.all(color: color, width: active ? 1.8 : 1.0),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'JetBrains Mono',
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ),
    );
  }

  Widget _buildBodyForState(Color surfaceColor, double borderThickness) {
    switch (_uiState) {
      case ZeroLiteracyUiState.loading:
        return _buildLoadingRadarState(surfaceColor, borderThickness);
      case ZeroLiteracyUiState.empty:
        return _buildEmptyLocationPromptState(surfaceColor, borderThickness);
      case ZeroLiteracyUiState.error:
        return _buildErrorOfflinePocketEdgeState(surfaceColor, borderThickness);
      case ZeroLiteracyUiState.populated:
        return _buildPopulatedSensoryDashboard(surfaceColor, borderThickness);
    }
  }

  /// 1. Loading State: Vòng sóng radar xanh ngọc co giãn quanh biểu tượng vệ tinh
  Widget _buildLoadingRadarState(Color surfaceColor, double borderThickness) {
    return GestureDetector(
      key: const ValueKey<String>('state_loading'),
      onTap: () => _speak(
        'Cháu đang tìm vị trí ruộng của bác, bác chờ cháu một chút nhé!',
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Container(
            padding: const EdgeInsets.all(20.0),
            decoration: BoxDecoration(
              color: surfaceColor,
              borderRadius: BorderRadius.circular(20.0),
              border: Border.all(color: kCyanAccent, width: borderThickness),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, _) {
                    return CustomPaint(
                      size: const Size(140.0, 140.0),
                      painter: RadarSatellitePictogramPainter(
                        pulseProgress: _pulseController.value,
                        primaryColor: kCyanAccent,
                        accentGreen: kTrafficGreen,
                      ),
                    );
                  },
                ),
                const SizedBox(height: 14.0),
                const Text(
                  'ĐANG KHÓA VỆ TINH RUỘNG H3 RES-8',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16.5,
                    fontWeight: FontWeight.w600,
                    color: kCyanAccent,
                  ),
                ),
                const SizedBox(height: 8.0),
                const Text(
                  '“Cháu đang tìm vị trí ruộng của bác, bác chờ cháu một chút nhé!”',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13.5,
                    height: 1.5,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// 2. Empty State: Chưa Đứng Ngoài Ruộng / Chưa Cấp Quyền Vị Trí
  Widget _buildEmptyLocationPromptState(
    Color surfaceColor,
    double borderThickness,
  ) {
    return Center(
      key: const ValueKey<String>('state_empty'),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Container(
          padding: const EdgeInsets.all(20.0),
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(20.0),
            border: Border.all(color: kTrafficGreen, width: borderThickness),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: () => _switchUiState(ZeroLiteracyUiState.populated),
                child: AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, _) {
                    return CustomPaint(
                      size: const Size(148.0, 148.0),
                      painter: FarmerFieldArrowPictogramPainter(
                        bounceFactor: _pulseController.value,
                        arrowColor: kTrafficGreen,
                        cyanColor: kCyanAccent,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 14.0),
              const Text(
                'BẤM MŨI TÊN XANH ĐỂ ĐỊNH VỊ CÁNH ĐỒNG',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16.5,
                  fontWeight: FontWeight.w600,
                  color: kTrafficGreen,
                ),
              ),
              const SizedBox(height: 8.0),
              const Text(
                '“Bác bấm vào hình mũi tên xanh ở giữa để cháu biết ruộng mình ở đâu nhé!”',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13.5,
                  height: 1.5,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 14.0),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: kTrafficGreen,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18.0,
                    vertical: 10.0,
                  ),
                ),
                onPressed: () => _switchUiState(ZeroLiteracyUiState.populated),
                child: const Text(
                  'CHẠM ĐỂ VÀO RUỘNG NGAY',
                  style: TextStyle(
                    fontFamily: 'JetBrains Mono',
                    fontSize: 12.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// 3. Error State: Mất Sóng 4G -> Tự Động Chuyển Chế Độ Đồng Ruộng Offline AA-SKU-4
  /// (MobileNetV4 + VieNeu-TTS-v3-Nano + Gemma-4-E2B / Qwen3.5-0.8B, ONNX/GGUF/LiteRT-LM Apache-2.0, < 5 KB H3 Delta)
  Widget _buildErrorOfflinePocketEdgeState(
    Color surfaceColor,
    double borderThickness,
  ) {
    final packet = _activePacket;
    return Padding(
      key: const ValueKey<String>('state_error'),
      padding: const EdgeInsets.all(14.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () => _speak(
              'Ngoài đồng đang mất mạng nhưng không sao đâu bác, máy của bác vẫn soi lá bắt bệnh và xem lịch tưới bình thường!',
            ),
            child: Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(18.0),
                border:
                    Border.all(color: kTrafficGreen, width: borderThickness),
              ),
              child: Column(
                children: [
                  CustomPaint(
                    size: const Size(160.0, 96.0),
                    painter: OfflineShieldPhonePictogramPainter(
                      shieldColor: kTrafficGreen,
                      accentCyan: kCyanAccent,
                      warnColor: kTrafficAmber,
                    ),
                  ),
                  const SizedBox(height: 10.0),
                  const Text(
                    'CHẾ ĐỘ ĐỒNG RUỘNG OFFLINE • AA-SKU-4 EDGE',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16.0,
                      fontWeight: FontWeight.w600,
                      color: kTrafficGreen,
                    ),
                  ),
                  const SizedBox(height: 6.0),
                  const Text(
                    '“Ngoài đồng đang mất mạng nhưng không sao đâu bác, máy của bác vẫn soi lá bắt bệnh và xem lịch tưới bình thường!”',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13.5,
                      height: 1.5,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8.0),
                  Text(
                    'MobileNetV4 + VieNeu-TTS-v3-Nano + Gemma-4-E2B / Qwen3.5-0.8B (ONNX/GGUF/LiteRT-LM) • H3 ${(packet.packetSizeBytes / 1024).toStringAsFixed(1)}KB',
                    style: const TextStyle(
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11.5,
                      color: kCyanAccent,
                    ),
                  ),
                ],
              ),
            ),
          ),
          _buildGiantCenterVoiceCameraOrb(surfaceColor, borderThickness),
          _buildBottomThreeActionCards(surfaceColor, borderThickness),
        ],
      ),
    );
  }

  /// 4. Populated State: Top 3-Color Traffic Light + Center Giant Voice/Camera Button + Bottom 3 Action Cards
  Widget _buildPopulatedSensoryDashboard(
    Color surfaceColor,
    double borderThickness,
  ) {
    return Padding(
      key: const ValueKey<String>('state_populated'),
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildTopAgroTrafficLightBanner(surfaceColor, borderThickness),
          _buildGiantCenterVoiceCameraOrb(surfaceColor, borderThickness),
          _buildBottomThreeActionCards(surfaceColor, borderThickness),
        ],
      ),
    );
  }

  /// Top Half: Đèn Giao Thông Nông Vụ 3 Màu (#10B981 Xanh, #F59E0B Vàng, #EF4444 Đỏ)
  Widget _buildTopAgroTrafficLightBanner(
    Color surfaceColor,
    double borderThickness,
  ) {
    final packet = _activePacket;
    final Color activeColor = _signalColor(_trafficSignal);

    return GestureDetector(
      onTap: () => _speak(packet.spokenTrafficPrompt),
      child: Container(
        padding: const EdgeInsets.all(12.0),
        decoration: BoxDecoration(
          color: surfaceColor,
          borderRadius: BorderRadius.circular(18.0),
          border: Border.all(color: activeColor, width: borderThickness + 0.5),
          boxShadow: [
            BoxShadow(
              color: activeColor.withValues(alpha: 0.25),
              blurRadius: 14.0,
              spreadRadius: 1.0,
            ),
          ],
        ),
        child: Row(
          children: [
            // 3-Light Vertical Pillar
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8.0, vertical: 10.0),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(14.0),
                border: Border.all(color: Colors.white24, width: 1.2),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildTrafficLampCircle(
                    color: kTrafficGreen,
                    isActive: _trafficSignal == AgroTrafficSignal.greenSafe,
                    onTap: () =>
                        _switchTrafficSignal(AgroTrafficSignal.greenSafe),
                  ),
                  const SizedBox(height: 8.0),
                  _buildTrafficLampCircle(
                    color: kTrafficAmber,
                    isActive:
                        _trafficSignal == AgroTrafficSignal.yellowIrrigate,
                    onTap: () =>
                        _switchTrafficSignal(AgroTrafficSignal.yellowIrrigate),
                  ),
                  const SizedBox(height: 8.0),
                  _buildTrafficLampCircle(
                    color: kTrafficRed,
                    isActive: _trafficSignal == AgroTrafficSignal.redHazard,
                    onTap: () =>
                        _switchTrafficSignal(AgroTrafficSignal.redHazard),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12.0),
            // Animated Vector Pictogram of Crop / Water / Frost / Pest
            AnimatedBuilder(
              animation: _pulseController,
              builder: (context, _) {
                return CustomPaint(
                  size: const Size(76.0, 76.0),
                  painter: AgroTrafficLightPictogramPainter(
                    signal: _trafficSignal,
                    animValue: _pulseController.value,
                  ),
                );
              },
            ),
            const SizedBox(width: 12.0),
            // Folk Unit Summary & KPI Numbers (fontSize <= 22.0)
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _trafficHeadline(_trafficSignal),
                    style: TextStyle(
                      fontSize: 16.5,
                      fontWeight: FontWeight.w600,
                      color: activeColor,
                    ),
                  ),
                  const SizedBox(height: 4.0),
                  Row(
                    children: [
                      Text(
                        'ET0 ${packet.et0MmDay.toStringAsFixed(1)}mm',
                        style: const TextStyle(
                          fontFamily: 'JetBrains Mono',
                          fontSize: 19.0, // .kpi-number 18px-22px
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 10.0),
                      Text(
                        'Ẩm ${(packet.soilMoistureRootZone * 100).toStringAsFixed(0)}%',
                        style: const TextStyle(
                          fontFamily: 'JetBrains Mono',
                          fontSize: 19.0, // .kpi-number 18px-22px
                          fontWeight: FontWeight.w700,
                          color: kCyanAccent,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    packet.spokenTrafficPrompt,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13.0,
                      height: 1.5,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _trafficHeadline(AgroTrafficSignal signal) {
    switch (signal) {
      case AgroTrafficSignal.greenSafe:
        return 'ĐÈN XANH • ĐỒNG RUỘNG AN TOÀN';
      case AgroTrafficSignal.yellowIrrigate:
        return 'ĐÈN VÀNG • CẦN TƯỚI NƯỚC HÔM NAY';
      case AgroTrafficSignal.redHazard:
        return 'ĐÈN ĐỎ • MỨC CHÚ Ý MẶN / SƯƠNG MUỐI / ĐẠO ÔN';
    }
  }

  Widget _buildTrafficLampCircle({
    required Color color,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 24.0,
        height: 24.0,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isActive ? color : color.withValues(alpha: 0.2),
          border: Border.all(
            color: isActive ? Colors.white : color.withValues(alpha: 0.5),
            width: isActive ? 2.2 : 1.0,
          ),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: color.withValues(alpha: 0.8),
                    blurRadius: 10.0,
                    spreadRadius: 2.0,
                  ),
                ]
              : const [],
        ),
      ),
    );
  }

  /// Center: 1 Nút Tròn Khổng Lồ (Chạm để Nói & Giơ Camera Soi Lá/Đất - AR Live Leaf Doctor)
  Widget _buildGiantCenterVoiceCameraOrb(
    Color surfaceColor,
    double borderThickness,
  ) {
    final packet = _activePacket;
    return GestureDetector(
      onTap: () {
        setState(() {
          _arCameraDoctorActive = !_arCameraDoctorActive;
        });
        _speak(packet.spokenLeafDoctorPrompt);
      },
      child: AnimatedBuilder(
        animation: _pulseController,
        builder: (context, _) {
          final double glowSpread = 2.0 + (_pulseController.value * 6.0);
          return Container(
            width: 172.0,
            height: 172.0,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: surfaceColor,
              border: Border.all(
                color: _arCameraDoctorActive ? kTrafficGreen : kCyanAccent,
                width: borderThickness + 2.0,
              ),
              boxShadow: [
                BoxShadow(
                  color: (_arCameraDoctorActive ? kTrafficGreen : kCyanAccent)
                      .withValues(alpha: 0.35),
                  blurRadius: 18.0,
                  spreadRadius: glowSpread,
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CustomPaint(
                  size: const Size(74.0, 74.0),
                  painter: MicAndCameraLeafPictogramPainter(
                    primaryCyan: kCyanAccent,
                    leafGreen: kTrafficGreen,
                    isScanning: _arCameraDoctorActive,
                  ),
                ),
                const SizedBox(height: 8.0),
                Text(
                  _arCameraDoctorActive
                      ? 'ĐANG SOI LÁ & NGHE...'
                      : 'CHẠM NÓI & SOI LÁ',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 15.0,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 2.0),
                const Text(
                  'AA-SKU-4 • MobileNetV4 + VieNeu-TTS',
                  style: TextStyle(
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11.0,
                    color: kCyanAccent,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  /// Bottom Half: 3 Thẻ Hình Vẽ Hành Động ([Xô Nước], [Hạt Giống], [Cái Loa 5h30 Sáng])
  Widget _buildBottomThreeActionCards(
    Color surfaceColor,
    double borderThickness,
  ) {
    final packet = _activePacket;
    return Row(
      children: [
        Expanded(
          child: _buildActionPictogramCard(
            title: 'TƯỚI HÔM NAY',
            folkMetric: '1 đốt ngón tay',
            accentColor: kCyanAccent,
            surfaceColor: surfaceColor,
            borderThickness: borderThickness,
            pictogramKind: ActionPictogramKind.waterBucket,
            onTapSpeak: () => _speak(packet.spokenWaterBucketPrompt),
          ),
        ),
        const SizedBox(width: 8.0),
        Expanded(
          child: _buildActionPictogramCard(
            title: 'LỊCH GIEO / BÓN',
            folkMetric: 'Nửa nắp / bình 16L',
            accentColor: kTrafficGreen,
            surfaceColor: surfaceColor,
            borderThickness: borderThickness,
            pictogramKind: ActionPictogramKind.seedlingBag,
            onTapSpeak: () => _speak(packet.spokenSeedSchedulePrompt),
          ),
        ),
        const SizedBox(width: 8.0),
        Expanded(
          child: _buildActionPictogramCard(
            title: 'ĐÀI 5H30 SÁNG',
            folkMetric: 'Nghe lại bản tin',
            accentColor: kTrafficAmber,
            surfaceColor: surfaceColor,
            borderThickness: borderThickness,
            pictogramKind: ActionPictogramKind.morningHorn,
            onTapSpeak: () => _speak(packet.spokenMorningRadioPrompt),
          ),
        ),
      ],
    );
  }

  Widget _buildActionPictogramCard({
    required String title,
    required String folkMetric,
    required Color accentColor,
    required Color surfaceColor,
    required double borderThickness,
    required ActionPictogramKind pictogramKind,
    required VoidCallback onTapSpeak,
  }) {
    return GestureDetector(
      onTap: onTapSpeak,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 10.0),
        decoration: BoxDecoration(
          color: surfaceColor,
          borderRadius: BorderRadius.circular(14.0),
          border: Border.all(color: accentColor, width: borderThickness),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomPaint(
              size: const Size(48.0, 48.0),
              painter: ActionCardPictogramPainter(
                kind: pictogramKind,
                color: accentColor,
              ),
            ),
            const SizedBox(height: 6.0),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.0,
                fontWeight: FontWeight.w600,
                color: accentColor,
              ),
            ),
            const SizedBox(height: 2.0),
            Text(
              folkMetric,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11.5,
                color: Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Tap-to-Speak Everything Active Voice Bar at bottom
  Widget _buildVoiceFeedbackFooter(
    Color surfaceColor,
    double borderThickness,
  ) {
    return GestureDetector(
      onTap: () => _speak(_lastSpokenTranscript),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
        decoration: BoxDecoration(
          color: surfaceColor,
          border: Border(
            top: BorderSide(color: kCyanAccent, width: borderThickness),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
              decoration: BoxDecoration(
                color: kTrafficGreen.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(6.0),
                border: Border.all(color: kTrafficGreen, width: 1.0),
              ),
              child: const Text(
                '🔊 LOA ĐỌC',
                style: TextStyle(
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: kTrafficGreen,
                ),
              ),
            ),
            const SizedBox(width: 10.0),
            Expanded(
              child: Text(
                _lastSpokenTranscript,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13.0,
                  height: 1.5,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

enum ActionPictogramKind {
  waterBucket,
  seedlingBag,
  morningHorn,
}

/// CustomPainter for Radar Satellite in Loading State
class RadarSatellitePictogramPainter extends CustomPainter {
  final double pulseProgress;
  final Color primaryColor;
  final Color accentGreen;

  const RadarSatellitePictogramPainter({
    required this.pulseProgress,
    required this.primaryColor,
    required this.accentGreen,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Offset center = Offset(size.width / 2, size.height / 2);
    final double maxRadius = size.width * 0.46;

    for (int ring = 1; ring <= 3; ring++) {
      final double radius =
          maxRadius * ((ring / 3.0) * 0.7 + pulseProgress * 0.3);
      final Paint wavePaint = Paint()
        ..color = primaryColor.withValues(alpha: (1.0 - (ring * 0.25)))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.2;
      canvas.drawCircle(center, radius, wavePaint);
    }

    // Satellite body
    final Paint bodyPaint = Paint()
      ..color = accentGreen
      ..style = PaintingStyle.fill;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: center, width: 22.0, height: 22.0),
        const Radius.circular(5.0),
      ),
      bodyPaint,
    );

    // Solar wings
    final Paint wingPaint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.fill;
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(center.dx - 24.0, center.dy),
        width: 18.0,
        height: 12.0,
      ),
      wingPaint,
    );
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(center.dx + 24.0, center.dy),
        width: 18.0,
        height: 12.0,
      ),
      wingPaint,
    );
  }

  @override
  bool shouldRepaint(covariant RadarSatellitePictogramPainter oldDelegate) {
    return oldDelegate.pulseProgress != pulseProgress;
  }
}

/// CustomPainter for Empty State (Farmer & Giant Green Arrow pointing to Field)
class FarmerFieldArrowPictogramPainter extends CustomPainter {
  final double bounceFactor;
  final Color arrowColor;
  final Color cyanColor;

  const FarmerFieldArrowPictogramPainter({
    required this.bounceFactor,
    required this.arrowColor,
    required this.cyanColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Offset center = Offset(size.width / 2, size.height / 2);

    // Conical Vietnamese Farmer Hat (Nón lá)
    final Path hatPath = Path()
      ..moveTo(center.dx - 38.0, center.dy - 18.0)
      ..lineTo(center.dx, center.dy - 46.0)
      ..lineTo(center.dx + 38.0, center.dy - 18.0)
      ..close();
    canvas.drawPath(
      hatPath,
      Paint()
        ..color = cyanColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0,
    );

    // Pulsing Green Arrow in center
    final double dyOffset = (bounceFactor - 0.5) * 8.0;
    final Path arrowPath = Path()
      ..moveTo(center.dx - 22.0, center.dy + 10.0 + dyOffset)
      ..lineTo(center.dx + 8.0, center.dy + 10.0 + dyOffset)
      ..lineTo(center.dx + 8.0, center.dy - 2.0 + dyOffset)
      ..lineTo(center.dx + 32.0, center.dy + 16.0 + dyOffset)
      ..lineTo(center.dx + 8.0, center.dy + 34.0 + dyOffset)
      ..lineTo(center.dx + 8.0, center.dy + 22.0 + dyOffset)
      ..lineTo(center.dx - 22.0, center.dy + 22.0 + dyOffset)
      ..close();
    canvas.drawPath(
      arrowPath,
      Paint()
        ..color = arrowColor
        ..style = PaintingStyle.fill,
    );
  }

  @override
  bool shouldRepaint(covariant FarmerFieldArrowPictogramPainter oldDelegate) {
    return oldDelegate.bounceFactor != bounceFactor;
  }
}

/// CustomPainter for Error / Offline State (Crossed Cloud -> Phone with Green Shield)
class OfflineShieldPhonePictogramPainter extends CustomPainter {
  final Color shieldColor;
  final Color accentCyan;
  final Color warnColor;

  const OfflineShieldPhonePictogramPainter({
    required this.shieldColor,
    required this.accentCyan,
    required this.warnColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Left: Crossed Cloud
    final Offset cloudCenter = Offset(size.width * 0.25, size.height * 0.5);
    final Paint cloudPaint = Paint()
      ..color = warnColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;
    canvas.drawCircle(cloudCenter, 18.0, cloudPaint);
    canvas.drawLine(
      Offset(cloudCenter.dx - 16.0, cloudCenter.dy - 16.0),
      Offset(cloudCenter.dx + 16.0, cloudCenter.dy + 16.0),
      cloudPaint,
    );

    // Arrow to Right
    final Paint arrowPaint = Paint()
      ..color = accentCyan
      ..strokeWidth = 2.5;
    canvas.drawLine(
      Offset(size.width * 0.42, size.height * 0.5),
      Offset(size.width * 0.56, size.height * 0.5),
      arrowPaint,
    );

    // Right: Phone with Green Shield
    final Rect phoneRect = Rect.fromCenter(
      center: Offset(size.width * 0.74, size.height * 0.5),
      width: 36.0,
      height: 62.0,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(phoneRect, const Radius.circular(7.0)),
      Paint()
        ..color = shieldColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0,
    );

    final Path shieldPath = Path()
      ..moveTo(phoneRect.center.dx, phoneRect.center.dy - 14.0)
      ..lineTo(phoneRect.center.dx + 11.0, phoneRect.center.dy - 8.0)
      ..lineTo(phoneRect.center.dx + 8.0, phoneRect.center.dy + 10.0)
      ..lineTo(phoneRect.center.dx, phoneRect.center.dy + 16.0)
      ..lineTo(phoneRect.center.dx - 8.0, phoneRect.center.dy + 10.0)
      ..lineTo(phoneRect.center.dx - 11.0, phoneRect.center.dy - 8.0)
      ..close();
    canvas.drawPath(
      shieldPath,
      Paint()
        ..color = shieldColor
        ..style = PaintingStyle.fill,
    );
  }

  @override
  bool shouldRepaint(covariant OfflineShieldPhonePictogramPainter oldDelegate) {
    return false;
  }
}

/// CustomPainter for Top Traffic Light Pictogram (Rice Stalk / Water Bucket / Frost & Pest)
class AgroTrafficLightPictogramPainter extends CustomPainter {
  final AgroTrafficSignal signal;
  final double animValue;

  const AgroTrafficLightPictogramPainter({
    required this.signal,
    required this.animValue,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Offset center = Offset(size.width / 2, size.height / 2);
    switch (signal) {
      case AgroTrafficSignal.greenSafe:
        final Paint greenPaint = Paint()
          ..color = const Color(0xFF10B981)
          ..strokeWidth = 3.2
          ..style = PaintingStyle.stroke;
        // Healthy rice stalk & sun
        canvas.drawLine(
          Offset(center.dx, size.height * 0.85),
          Offset(center.dx, size.height * 0.2),
          greenPaint,
        );
        canvas.drawOval(
          Rect.fromCenter(
            center: Offset(center.dx - 10.0, center.dy),
            width: 14.0,
            height: 7.0,
          ),
          greenPaint,
        );
        canvas.drawOval(
          Rect.fromCenter(
            center: Offset(center.dx + 10.0, center.dy - 8.0),
            width: 14.0,
            height: 7.0,
          ),
          greenPaint,
        );
        break;

      case AgroTrafficSignal.yellowIrrigate:
        final Paint amberPaint = Paint()
          ..color = const Color(0xFFF59E0B)
          ..strokeWidth = 3.0
          ..style = PaintingStyle.stroke;
        // Sun & pouring water droplets
        canvas.drawCircle(
          Offset(center.dx, center.dy - 10.0),
          14.0 + (animValue * 2.0),
          amberPaint,
        );
        canvas.drawCircle(
          Offset(center.dx - 10.0, center.dy + 18.0),
          4.0,
          Paint()..color = const Color(0xFF00F0FF),
        );
        canvas.drawCircle(
          Offset(center.dx + 10.0, center.dy + 18.0),
          4.0,
          Paint()..color = const Color(0xFF00F0FF),
        );
        break;

      case AgroTrafficSignal.redHazard:
        final Paint redPaint = Paint()
          ..color = const Color(0xFFEF4444)
          ..strokeWidth = 3.0
          ..style = PaintingStyle.stroke;
        // Warning triangle + frost / salinity wave
        final Path triangle = Path()
          ..moveTo(center.dx, size.height * 0.16)
          ..lineTo(size.width * 0.84, size.height * 0.82)
          ..lineTo(size.width * 0.16, size.height * 0.82)
          ..close();
        canvas.drawPath(triangle, redPaint);
        canvas.drawLine(
          Offset(center.dx, center.dy - 8.0),
          Offset(center.dx, center.dy + 8.0),
          redPaint,
        );
        break;
    }
  }

  @override
  bool shouldRepaint(covariant AgroTrafficLightPictogramPainter oldDelegate) {
    return oldDelegate.signal != signal || oldDelegate.animValue != animValue;
  }
}

/// CustomPainter for Giant Center Button (Microphone + Camera Leaf Scanner)
class MicAndCameraLeafPictogramPainter extends CustomPainter {
  final Color primaryCyan;
  final Color leafGreen;
  final bool isScanning;

  const MicAndCameraLeafPictogramPainter({
    required this.primaryCyan,
    required this.leafGreen,
    required this.isScanning,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Offset center = Offset(size.width / 2, size.height / 2);

    // Microphone capsule on left
    final Paint micPaint = Paint()
      ..color = primaryCyan
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.8;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(center.dx - 14.0, center.dy - 4.0),
          width: 16.0,
          height: 26.0,
        ),
        const Radius.circular(8.0),
      ),
      micPaint,
    );

    // Camera viewfinder & Leaf on right
    final Paint leafPaint = Paint()
      ..color = isScanning ? Colors.white : leafGreen
      ..style = PaintingStyle.fill;
    final Path leafPath = Path()
      ..moveTo(center.dx + 4.0, center.dy + 14.0)
      ..quadraticBezierTo(
        center.dx + 4.0,
        center.dy - 16.0,
        center.dx + 26.0,
        center.dy - 14.0,
      )
      ..quadraticBezierTo(
        center.dx + 26.0,
        center.dy + 14.0,
        center.dx + 4.0,
        center.dy + 14.0,
      );
    canvas.drawPath(leafPath, leafPaint);
  }

  @override
  bool shouldRepaint(covariant MicAndCameraLeafPictogramPainter oldDelegate) {
    return oldDelegate.isScanning != isScanning;
  }
}

/// CustomPainter for the 3 Bottom Action Pictogram Cards
class ActionCardPictogramPainter extends CustomPainter {
  final ActionPictogramKind kind;
  final Color color;

  const ActionCardPictogramPainter({
    required this.kind,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Offset c = Offset(size.width / 2, size.height / 2);
    final Paint strokePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.6;

    switch (kind) {
      case ActionPictogramKind.waterBucket:
        final Path bucket = Path()
          ..moveTo(c.dx - 14.0, c.dy - 8.0)
          ..lineTo(c.dx + 14.0, c.dy - 8.0)
          ..lineTo(c.dx + 10.0, c.dy + 16.0)
          ..lineTo(c.dx - 10.0, c.dy + 16.0)
          ..close();
        canvas.drawPath(bucket, strokePaint);
        canvas.drawArc(
          Rect.fromCenter(
            center: Offset(c.dx, c.dy - 8.0),
            width: 24.0,
            height: 16.0,
          ),
          math.pi,
          math.pi,
          false,
          strokePaint,
        );
        break;

      case ActionPictogramKind.seedlingBag:
        canvas.drawLine(
          Offset(c.dx, c.dy + 16.0),
          Offset(c.dx, c.dy - 12.0),
          strokePaint,
        );
        canvas.drawOval(
          Rect.fromCenter(
            center: Offset(c.dx - 8.0, c.dy - 2.0),
            width: 12.0,
            height: 6.0,
          ),
          strokePaint,
        );
        canvas.drawOval(
          Rect.fromCenter(
            center: Offset(c.dx + 8.0, c.dy - 8.0),
            width: 12.0,
            height: 6.0,
          ),
          strokePaint,
        );
        break;

      case ActionPictogramKind.morningHorn:
        final Path horn = Path()
          ..moveTo(c.dx - 14.0, c.dy - 4.0)
          ..lineTo(c.dx - 4.0, c.dy - 4.0)
          ..lineTo(c.dx + 10.0, c.dy - 14.0)
          ..lineTo(c.dx + 10.0, c.dy + 14.0)
          ..lineTo(c.dx - 4.0, c.dy + 4.0)
          ..lineTo(c.dx - 14.0, c.dy + 4.0)
          ..close();
        canvas.drawPath(horn, strokePaint);
        break;
    }
  }

  @override
  bool shouldRepaint(covariant ActionCardPictogramPainter oldDelegate) {
    return oldDelegate.kind != kind || oldDelegate.color != color;
  }
}
