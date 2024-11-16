
import { Item } from '../components/Board/types/board';
import { geminiService } from '@/app/services/geminiService';
import { toast } from 'react-toastify';

export const handleGenerateReport = async (item: Item) => {
  try {
    toast.info("Đang tạo báo cáo...");
    const report = await geminiService.generateProjectReport(item);
    // TODO: Handle the report result, e.g. show in a modal or download
    console.log(report);
    toast.success("Đã tạo báo cáo thành công!");
  } catch {
    toast.error("Không thể tạo báo cáo");
  }
};