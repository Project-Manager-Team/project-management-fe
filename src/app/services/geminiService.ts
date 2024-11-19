import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProjectData } from "../types/project";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error(
    "Missing Gemini API key - please add NEXT_PUBLIC_GEMINI_API_KEY to .env.local"
  );
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export const geminiService = {
  async generateProjectReport(projectData: ProjectData): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-002",
    });

    const generateTreeStructure = (data: ProjectData, level = 0): string => {
      const indent = "  ".repeat(level);
      let tree = `${indent}- ${data.title}\n`;
      tree += `${indent}  Tiến độ: ${data.progress}%\n`;
      if (data.managers?.length) {
        tree += `${indent}  Quản lý: ${data.managers
          .map((m) => m.username)
          .join(", ")}\n`;
      }
      tree += "\n";
      if (data.children && data.children.length > 0) {
        tree += data.children
          .map((child) => generateTreeStructure(child, level + 1))
          .join("");
      }
      return tree;
    };
    const prompt = `
    Phân tích chi tiết dự án sau và tạo báo cáo toàn diện:

    1. THÔNG TIN TỔNG QUAN:
    - Tên dự án: ${projectData.title}
    - Mô tả: ${projectData.description}
    - Chủ sở hữu: ${projectData.owner.username}
    - Loại dự án: ${projectData.type}
    
    2. PHÂN TÍCH TIẾN ĐỘ VÀ THỜI GIAN:
    - Tiến độ hiện tại: ${projectData.progress}%
    - Mức độ phức tạp: ${projectData.diffLevel}/5
    - Thời gian bắt đầu: ${projectData.beginTime || "Chưa xác định"}
    - Thời gian dự kiến hoàn thành: ${projectData.endTime || "Chưa xác định"}
    - Thời gian hoàn thành thực tế: ${
      projectData.completeTime || "Chưa hoàn thành"
    }
    
    3. CẤU TRÚC PHÂN RÃ CÔNG VIỆC:

    | Công việc | Tiến độ | Quản lý | Trạng thái |
    |-----------|---------|---------|------------|
    ${(function generateTable(projectData: ProjectData): string {
      let table = "";
      const addRow = (item: ProjectData, prefix = "") => {
        const status = item.completeTime ? "Hoàn thành" : "Đang thực hiện";
        table += `| ${prefix}${item.title} | ${item.progress}% | ${
          item.managers?.map((m) => m.username).join(", ") || "N/A"
        } | ${status} |\n`;
        item.children?.forEach((child) => addRow(child, prefix + "-- "));
      };
      addRow(projectData);
      return table;
    })(projectData)}

    4. PHÂN TÍCH CHI TIẾT CÔNG VIỆC:
    ${generateTreeStructure(projectData)}
    
    5. QUẢN LÝ VÀ PHÂN QUYỀN:
    - Số lượng quản lý: ${projectData.managersCount}
    - Danh sách quản lý:
      ${
        projectData.managers
          ?.map((manager) => `+ ${manager.username}`)
          .join("\n      ") || "Không có"
      }
    
    Vui lòng phân tích và tạo báo cáo với các mục sau:

    # Báo cáo tổng quan dự án

    ## 1. Tổng quan tình hình
    [Phân tích tổng thể về tình hình dự án và đưa ra cấu trúc dự án]

    ## 2. Phân tích cấu trúc và thành phần
    [Phân tích chi tiết cấu trúc phân rã công việc]

    ## 3. Đánh giá tiến độ và quản lý thời gian
    [Nhận xét về tiến độ và việc quản lý thời gian]

    ## 4. Phân tích rủi ro và thách thức
    [Xác định các rủi ro và thách thức tiềm ẩn, bao gồm cả vấn đề quản lý thành vi��n]

    ## 5. Đánh giá cơ cấu quản lý
    [Phân tích hiệu quả của mô hình quản lý và phân quyền hiện tại]

    ## 6. Đề xuất và khuyến nghị
    [Đề xuất cụ thể để cải thiện, bao gồm các đề xuất về quản lý thành viên]
    `;
    console.log(prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  },
};
