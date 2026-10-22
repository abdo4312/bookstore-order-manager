import { OrderStatus, OrderWithDetails, BookStatus, Customer } from '../types';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

const statusTranslations: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'قيد الانتظار',
  [OrderStatus.Delivered]: 'تم التسليم',
  [OrderStatus.Cancelled]: 'تم الإلغاء',
};

export function exportOrdersToExcel(orders: OrderWithDetails[]): void {
  const data = orders.map((order) => {
    let itemsString = order.subject;
    if (order.items && order.items.length > 0) {
      itemsString = order.items
        .map((item) => {
          return `• ${item.bookName || 'كتاب'} (${item.quantity}) - ${item.type || 'عربي'} - ${item.publisherName || ''}`;
        })
        .join('\n');
    }

    return {
      'رقم الطلب': order.id,
      العميل: order.customerName,
      الهاتف: order.customerPhone,
      'السنة الدراسية': order.academicYearName || '-',
      'الكتب والتفاصيل': itemsString,
      العربون: Number(order.deposit),
      الموظف: order.employeeName || '-',
      'طريقة الدفع': order.paymentMethodName || '-',
      التاريخ: order.receivedDate,
      الحالة: statusTranslations[order.status],
      ملاحظات: order.notes || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 20 },
    { wch: 15 },
    { wch: 50 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  XLSX.writeFile(wb, 'تقرير_الطلبات_المجمع.xlsx');
}

export async function exportOrdersToBatchPDF(reportElement: HTMLElement): Promise<void> {
  const pages = reportElement.querySelectorAll('.report-page');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    const dataUrl = await toJpeg(pages[i] as HTMLElement, {
      quality: 0.9,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const printableWidth = pdfWidth - margin * 2;
    const printableHeight = pdfHeight - margin * 2;

    const imgProps = pdf.getImageProperties(dataUrl);
    const ratio = imgProps.width / imgProps.height;
    let imgWidth = printableWidth;
    let imgHeight = imgWidth / ratio;

    if (imgHeight > printableHeight) {
      imgHeight = printableHeight;
      imgWidth = imgHeight * ratio;
    }

    const x = margin + (printableWidth - imgWidth) / 2;
    const y = margin + (printableHeight - imgHeight) / 2;

    pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
  }

  pdf.save('تقرير_الطلبات.pdf');
}

export async function exportManifestPDF(reportElement: HTMLElement): Promise<void> {
  const pages = reportElement.querySelectorAll('.report-page');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    const dataUrl = await toJpeg(pages[i] as HTMLElement, {
      quality: 0.9,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const printableWidth = pdfWidth - margin * 2;
    const printableHeight = pdfHeight - margin * 2;

    const imgProps = pdf.getImageProperties(dataUrl);
    const ratio = imgProps.width / imgProps.height;
    let imgWidth = printableWidth;
    let imgHeight = imgWidth / ratio;

    if (imgHeight > printableHeight) {
      imgHeight = printableHeight;
      imgWidth = imgHeight * ratio;
    }

    const x = margin + (printableWidth - imgWidth) / 2;
    const y = margin + (printableHeight - imgHeight) / 2;

    pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
  }

  pdf.save('تقرير_المندوب.pdf');
}

function getGradeSortValue(grade: string): number {
  const g = grade.toLowerCase();
  let level = 5; // default
  if (g.includes('رياض')) level = 1;
  else if (g.includes('ابتدائي')) level = 2;
  else if (g.includes('إعدادي') || g.includes('اعدادي')) level = 3;
  else if (g.includes('بكالوريا')) level = 5;
  else if (g.includes('ثانوي')) level = 4;

  let yearNum = 0;
  if (g.includes('الأول') || g.includes('الاول') || g.includes('1')) yearNum = 1;
  else if (g.includes('الثاني') || g.includes('التاني') || g.includes('2')) yearNum = 2;
  else if (g.includes('الثالث') || g.includes('التالت') || g.includes('3')) yearNum = 3;
  else if (g.includes('الرابع') || g.includes('الرابع') || g.includes('4')) yearNum = 4;
  else if (g.includes('الخامس') || g.includes('الخامس') || g.includes('5')) yearNum = 5;
  else if (g.includes('السادس') || g.includes('السادس') || g.includes('6')) yearNum = 6;

  return level * 10 + yearNum;
}

export function exportManifestToExcel(orders: OrderWithDetails[]): void {
  // 1. تجميع البيانات الخام (تفاصيل العملاء)
  const rows: { grade: string; publisher: string; subject: string; customer: string; quantity: number }[] = [];

  orders.forEach((order) => {
    const pendingItems = order.items?.filter((item) => item.status === BookStatus.Pending) || [];
    pendingItems.forEach((item) => {
      rows.push({
        grade: item.grade || order.academicYearName || 'غير محدد',
        publisher: item.publisherName || 'غير محدد',
        subject: item.bookName || order.subject || 'غير محدد',
        customer: `${order.customerName} (${order.customerPhone})`,
        quantity: item.quantity
      });
    });
  });

  // 2. ترتيب البيانات
  rows.sort((a, b) => {
    const valA = getGradeSortValue(a.grade);
    const valB = getGradeSortValue(b.grade);
    if (valA !== valB) return valA - valB;
    return a.publisher.localeCompare(b.publisher, 'ar');
  });

  // 3. تجميع البيانات للورقة الأولى (الملخص)
  const summaryMap: Record<string, { grade: string; publisher: string; subject: string; totalQuantity: number }> = {};
  rows.forEach((row) => {
    const key = `${row.grade}-${row.publisher}-${row.subject}`;
    if (!summaryMap[key]) {
      summaryMap[key] = { grade: row.grade, publisher: row.publisher, subject: row.subject, totalQuantity: 0 };
    }
    summaryMap[key].totalQuantity += row.quantity;
  });

  const summaryRows = Object.values(summaryMap);
  summaryRows.sort((a, b) => {
    const valA = getGradeSortValue(a.grade);
    const valB = getGradeSortValue(b.grade);
    if (valA !== valB) return valA - valB;
    return a.publisher.localeCompare(b.publisher, 'ar');
  });

  // 4. تجهيز بيانات الإكسل
  let detailCounter = 1;
  const detailsData = rows.map(row => ({
    'م': detailCounter++,
    'المرحلة الدراسية': row.grade,
    'دار النشر': row.publisher,
    'اسم المادة': row.subject,
    'اسم العميل / رقم التليفون': row.customer,
    'العدد': row.quantity
  }));

  let summaryCounter = 1;
  const summaryData = summaryRows.map(row => ({
    'م': summaryCounter++,
    'المرحلة الدراسية': row.grade,
    'دار النشر': row.publisher,
    'اسم المادة': row.subject,
    'إجمالي المطلوب': row.totalQuantity,
    'تم الاستلام': '',
    'المتبقي': ''
  }));

  // دالة مساعدة لإنشاء وتنسيق الورقة
  const createStyledSheet = (data: any[], cols: any[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = cols;

    // تنسيق رؤوس الأعمدة
    const headerFill = { fill: { fgColor: { rgb: "4F81BD" } }, font: { color: { rgb: "FFFFFF" }, bold: true } };
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (ws[cellAddress]) ws[cellAddress].s = headerFill;
    }

    // تلوين الصفوف حسب المرحلة الدراسية
    const palette = ["E2EFDA", "FFF2CC", "FCE4D6", "DDEBF7", "E4DFEC", "D9EAD3", "FFF9E6", "F8D7DA", "D0E0E3", "C9DAF8"];
    const gradeColorMap: Record<string, string> = {};
    let colorIndex = 0;

    data.forEach(row => {
      const grade = row['المرحلة الدراسية'];
      if (grade && !gradeColorMap[grade]) {
        gradeColorMap[grade] = palette[colorIndex % palette.length];
        colorIndex++;
      }
    });

    const numCols = data.length > 0 ? Object.keys(data[0]).length : 0;
    for (let R = 1; R < data.length + 1; R++) {
      const gradeCell = XLSX.utils.encode_cell({ r: R, c: 1 });
      if (ws[gradeCell]) {
        const gradeText = ws[gradeCell].v as string;
        const color = gradeColorMap[gradeText] || "FFFFFF";
        for (let C = 0; C < numCols; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws[cellAddress]) {
            ws[cellAddress].s = { fill: { fgColor: { rgb: color } } };
          }
        }
      }
    }
    return ws;
  };

  const wsSummary = createStyledSheet(summaryData, [
    { wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
  ]);

  const wsDetails = createStyledSheet(detailsData, [
    { wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 35 }, { wch: 10 }
  ]);

  // 5. إنشاء ملف الإكسل بورقتين
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'ملخص المندوب');
  XLSX.utils.book_append_sheet(wb, wsDetails, 'تفاصيل العملاء');
  
  XLSX.writeFile(wb, 'تقرير_المندوب_المجمّع.xlsx', { cellStyles: true });
}

export function exportCustomersToExcel(customers: Customer[]): void {
  const data = customers.map((c, index) => ({
    'م': index + 1,
    'الاسم': c.name,
    'رقم الهاتف': c.phone,
    'الحالة': c.isBlocked ? 'محظور' : 'نشط',
    'سبب الحظر': c.blockReason || '',
    'ملاحظات': c.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 30 }];

  // تلوين رؤوس الأعمدة (Header)
  const headerFill = { fill: { fgColor: { rgb: "4F81BD" } }, font: { color: { rgb: "FFFFFF" }, bold: true } };
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[cellAddress]) ws[cellAddress].s = headerFill;
  }

  // تلوين الصفوف (Active = أخضر، Blocked = أحمر)
  for (let R = 1; R < data.length + 1; R++) {
    const statusCell = XLSX.utils.encode_cell({ r: R, c: 3 }); // عمود الحالة (Index 3)
    if (ws[statusCell]) {
      const statusText = ws[statusCell].v as string;
      const color = statusText === 'محظور' ? "F8D7DA" : "E2EFDA"; 
      for (let C = 0; C < 6; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[cellAddress]) {
          ws[cellAddress].s = { fill: { fgColor: { rgb: color } } };
        }
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'العملاء');
  XLSX.writeFile(wb, 'قائمة_العملاء.xlsx', { cellStyles: true });
}
