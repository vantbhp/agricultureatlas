import { CONTACT_EMAIL, GRANTS_EMAIL, RESEARCH_EMAIL, type Lang, type LegalDoc, type LegalKind } from './types';

const UPDATED = '2026-11-23';

/**
 * Privacy Policy and Terms of Use for the static open-science landing site (agricultureatlas.org).
 * Reviewed for legal and regulatory alignment: positioning is "reference agronomic indices",
 * explicitly not a hydro-meteorological forecast/warning service (Vietnam KTTV Law compliance).
 * NOT legal advice — to be confirmed by Vietnamese counsel before public launch.
 */
export const legal: Record<Lang, Record<LegalKind, LegalDoc>> = {
  en: {
    privacy: {
      title: 'Privacy Policy',
      updated: UPDATED,
      sections: [
        {
          heading: 'Summary',
          body: [
            'This website (agricultureatlas.org) is a static information and open-science research portal. It does not collect personal data, does not use tracking cookies and does not show advertising.',
          ],
        },
        {
          heading: 'Who we are',
          body: [
            'Agriculture Atlas is a non-commercial, non-profit public-good project that supports UN Sustainable Development Goals 2 (Zero Hunger) and 13 (Climate Action).',
          ],
        },
        {
          heading: 'Data we do not collect',
          body: [
            'The landing and research pages have no sign-up, no forms and no analytics or advertising scripts. We do not sell, rent or share personal data.',
            'Like any web server, the hosting provider may process technical request data (such as IP address and browser type) briefly to deliver the page and protect against abuse.',
          ],
        },
        {
          heading: 'Other Agriculture Atlas services',
          body: [
            'The assistant at agricultureatlas.org/en/chat and other Agriculture Atlas services are separate surfaces. Any data handling specific to them will be described where you use them.',
          ],
        },
        {
          heading: 'Email contact',
          body: [
            `If you email us at ${CONTACT_EMAIL}, ${RESEARCH_EMAIL} or ${GRANTS_EMAIL}, we use your address and message only to reply, and do not add you to any mailing list without your consent.`,
            "Sending an email is voluntary. We keep messages only as long as needed to respond and handle them in line with Vietnam's personal data protection rules.",
          ],
        },
        {
          heading: 'Changes',
          body: [
            'This is a temporary policy for the static portal. We will update this page when new services launch; the date above shows the latest revision.',
          ],
        },
      ],
    },
    terms: {
      title: 'Terms of Use',
      updated: UPDATED,
      sections: [
        {
          heading: 'Non-commercial public good',
          body: [
            'Agriculture Atlas is a non-commercial, non-profit open-science project that supports SDG 2 (Zero Hunger) and SDG 13 (Climate Action). The site is provided free of charge.',
          ],
        },
        {
          heading: 'Reference information only',
          body: [
            'Agronomic indices and research simulations from Agriculture Atlas are for reference only. They are derived from formulas, open-science models and open data and are not a guarantee of crop yield, weather or any outcome.',
            'Always combine Agriculture Atlas information with local knowledge and advice from agricultural extension services before making farming decisions.',
          ],
        },
        {
          heading: 'Not a forecast or warning service',
          body: [
            "Agriculture Atlas provides reference agronomic indices and research simulations only. It does not provide hydro-meteorological forecasts or warnings, or natural-disaster warnings. For official forecasts and warnings, refer to Vietnam's national hydro-meteorological service and competent authorities.",
          ],
        },
        {
          heading: 'Current status',
          body: [
            'During the preview, indices are computed with FAO-56 formulas from default regional inputs. No live satellite or weather data source and no trained AI model is connected yet. Values are illustrative and must not be used for farming decisions.',
          ],
        },
        {
          heading: 'Open data and licences',
          body: [
            'Agriculture Atlas plans to use open-science models and third-party datasets, including Microsoft Aurora (v1.5 / 0.1° / Wave / Air Pollution, MIT License, Nature 2025), NVIDIA Earth-2 (cBottle and FourCastNet 3, Apache-2.0), TerraMind-1.0-base and THOR-1.0-base (Apache-2.0), Copernicus Sentinel-1/2, NASA SMAP and MODIS via Microsoft Planetary Computer STAC and Google Earth Engine (Non-Commercial Research Access), as well as ECMWF AIFS 2.0 (CC-BY-4.0) and approved non-commercial multi-model earth-system research feeds for scientific cross-validation. Each remains subject to its own licence and attribution terms.',
            'Naming these sources does not imply endorsement by Microsoft, NVIDIA, ESA, the European Commission, NASA, ECMWF or Google. You may not use Agriculture Atlas outputs in breach of those licences.',
          ],
        },
        {
          heading: 'Vietnam sovereignty',
          body: [
            'Maps and data for Vietnam show the Hoàng Sa and Trường Sa archipelagos as part of Vietnam.',
          ],
        },
        {
          heading: 'No warranty and limitation of liability',
          body: [
            'The site and its content are provided "as is" without warranties of any kind. To the extent permitted by law, Agriculture Atlas is not liable for losses arising from use of the information.',
          ],
        },
        {
          heading: 'Contact',
          body: [`Questions about these terms: ${CONTACT_EMAIL} (research inquiries: ${RESEARCH_EMAIL}).`],
        },
      ],
    },
  },
  vi: {
    privacy: {
      title: 'Chính sách quyền riêng tư',
      updated: UPDATED,
      sections: [
        {
          heading: 'Tóm tắt',
          body: [
            'Trang web này (agricultureatlas.org) là cổng thông tin và nghiên cứu khoa học mở dạng tĩnh. Trang không thu thập dữ liệu cá nhân, không dùng cookie theo dõi và không hiển thị quảng cáo.',
          ],
        },
        {
          heading: 'Chúng tôi là ai',
          body: [
            'Agriculture Atlas là dự án công ích phi thương mại, phi lợi nhuận, hướng tới Mục tiêu Phát triển Bền vững số 2 (Không còn nạn đói) và số 13 (Hành động vì khí hậu) của Liên Hợp Quốc.',
          ],
        },
        {
          heading: 'Dữ liệu chúng tôi không thu thập',
          body: [
            'Trang giới thiệu và cổng nghiên cứu không có đăng ký, không có biểu mẫu và không có mã phân tích hay quảng cáo. Chúng tôi không bán, cho thuê hay chia sẻ dữ liệu cá nhân.',
            'Như mọi máy chủ web, nhà cung cấp hosting có thể xử lý ngắn hạn dữ liệu kỹ thuật của yêu cầu (như địa chỉ IP, loại trình duyệt) để phân phối trang và chống lạm dụng.',
          ],
        },
        {
          heading: 'Các dịch vụ Agriculture Atlas khác',
          body: [
            'Trợ lý tại agricultureatlas.org/vi/chat và các dịch vụ Agriculture Atlas khác là các giao diện riêng. Cách xử lý dữ liệu riêng của từng dịch vụ sẽ được nêu rõ tại nơi bạn sử dụng.',
          ],
        },
        {
          heading: 'Liên hệ qua email',
          body: [
            `Nếu bạn gửi email tới ${CONTACT_EMAIL}, ${RESEARCH_EMAIL} hoặc ${GRANTS_EMAIL}, chúng tôi chỉ dùng địa chỉ và nội dung thư để trả lời, và không thêm bạn vào danh sách nhận thư nào khi chưa có sự đồng ý.`,
            'Việc gửi email là tự nguyện. Chúng tôi chỉ lưu thư trong thời gian cần thiết để phản hồi và xử lý theo quy định bảo vệ dữ liệu cá nhân của Việt Nam.',
          ],
        },
        {
          heading: 'Thay đổi',
          body: [
            'Đây là chính sách tạm thời cho cổng thông tin tĩnh. Chúng tôi sẽ cập nhật khi ra mắt dịch vụ mới; ngày ở trên là lần sửa đổi gần nhất.',
          ],
        },
      ],
    },
    terms: {
      title: 'Điều khoản sử dụng',
      updated: UPDATED,
      sections: [
        {
          heading: 'Sản phẩm công ích phi thương mại',
          body: [
            'Agriculture Atlas là dự án khoa học mở phi thương mại, phi lợi nhuận, hướng tới SDG 2 (Không còn nạn đói) và SDG 13 (Hành động vì khí hậu) của Liên Hợp Quốc. Trang web được cung cấp miễn phí.',
          ],
        },
        {
          heading: 'Thông tin chỉ mang tính tham khảo',
          body: [
            'Các chỉ số nông học và mô phỏng nghiên cứu của Agriculture Atlas chỉ mang tính tham khảo. Chúng được tính từ công thức, mô hình khoa học mở và dữ liệu mở, không bảo đảm năng suất, thời tiết hay bất kỳ kết quả nào.',
            'Hãy luôn kết hợp thông tin từ Agriculture Atlas với kinh nghiệm địa phương và tư vấn của cán bộ khuyến nông trước khi ra quyết định canh tác.',
          ],
        },
        {
          heading: 'Không phải dịch vụ dự báo, cảnh báo',
          body: [
            'Agriculture Atlas chỉ cung cấp chỉ số nông học tham khảo và mô phỏng nghiên cứu, không cung cấp bản tin dự báo, cảnh báo khí tượng thủy văn hay cảnh báo thiên tai. Thông tin dự báo, cảnh báo chính thức vui lòng theo dõi cơ quan khí tượng thủy văn quốc gia và cơ quan có thẩm quyền.',
          ],
        },
        {
          heading: 'Tình trạng hiện tại',
          body: [
            'Trong giai đoạn xem trước, các chỉ số được tính bằng công thức FAO-56 từ dữ liệu đầu vào mặc định theo vùng; chưa kết nối nguồn dữ liệu vệ tinh, thời tiết trực tiếp và chưa có mô hình AI đã huấn luyện. Giá trị chỉ mang tính minh họa, không dùng để ra quyết định canh tác.',
          ],
        },
        {
          heading: 'Dữ liệu mở và giấy phép',
          body: [
            'Agriculture Atlas dự kiến sử dụng các mô hình khoa học mở và bộ dữ liệu bên thứ ba, gồm Microsoft Aurora (v1.5 / 0.1° / Wave / Air Pollution, giấy phép MIT, Nature 2025), NVIDIA Earth-2 (cBottle và FourCastNet 3, Apache-2.0), TerraMind-1.0-base và THOR-1.0-base (Apache-2.0), Copernicus Sentinel-1/2, NASA SMAP và MODIS qua Microsoft Planetary Computer STAC và Google Earth Engine (quyền nghiên cứu phi thương mại), cùng ECMWF AIFS 2.0 (CC-BY-4.0) và các nguồn dữ liệu nghiên cứu đa mô hình hệ Trái Đất phi thương mại đã được phê duyệt để kiểm chứng chéo khoa học. Mỗi nguồn tuân theo giấy phép và yêu cầu ghi nguồn riêng.',
            'Việc nêu tên các nguồn này không có nghĩa là Microsoft, NVIDIA, ESA, Ủy ban châu Âu, NASA, ECMWF hay Google bảo trợ Agriculture Atlas. Bạn không được sử dụng kết quả của Agriculture Atlas theo cách vi phạm các giấy phép đó.',
          ],
        },
        {
          heading: 'Chủ quyền Việt Nam',
          body: [
            'Bản đồ và dữ liệu về Việt Nam thể hiện quần đảo Hoàng Sa và quần đảo Trường Sa là một phần lãnh thổ Việt Nam.',
          ],
        },
        {
          heading: 'Không bảo đảm và giới hạn trách nhiệm',
          body: [
            'Trang web và nội dung được cung cấp "nguyên trạng", không kèm bất kỳ bảo đảm nào. Trong phạm vi pháp luật cho phép, Agriculture Atlas không chịu trách nhiệm về thiệt hại phát sinh từ việc sử dụng thông tin.',
          ],
        },
        {
          heading: 'Liên hệ',
          body: [`Câu hỏi về các điều khoản này: ${CONTACT_EMAIL} (trao đổi nghiên cứu: ${RESEARCH_EMAIL}).`],
        },
      ],
    },
  },
};
