// 그림책 PDF 저장, 이미지 다운로드, 인쇄 지원 서비스
import { jsPDF } from 'jspdf';

export class ExportService {
  /**
   * 완성된 그림책(표지 포함 총 6페이지)을 고화질 컬러 PDF 전자책으로 저장
   */
  static async saveAsPDF(pages, title = '나만의_그림책') {
    if (!pages || pages.length === 0) return;

    // A4 가로 (Landscape, 297mm x 210mm)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 297;
    const pageHeight = 210;

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        doc.addPage('a4', 'landscape');
      }

      const p = pages[i];
      // 캔버스 이미지 추가
      const imgData = p.canvas ? p.canvas.toDataURL('image/jpeg', 0.95) : p.dataUrl;
      doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }

    const safeFilename = (title || '나만의_그림책').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
    doc.save(`${safeFilename}.pdf`);
  }

  /**
   * 단일 페이지를 고화질 PNG 이미지로 저장
   */
  static downloadPageImage(page, title = '그림책_페이지') {
    if (!page || !page.canvas) return;

    const link = document.createElement('a');
    link.download = `${title}_${page.isCover ? '표지' : page.pageNumber + '장'}.png`;
    link.href = page.canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 모든 페이지를 순차적으로 이미지 다운로드
   */
  static async downloadAllPagesAsImages(pages, title = '나만의_그림책') {
    for (let i = 0; i < pages.length; i++) {
      ExportService.downloadPageImage(pages[i], title);
      // 브라우저 팝업 차단 방지를 위한 약간의 딜레이
      await new Promise(r => setTimeout(r, 400));
    }
  }

  /**
   * A4 종이 인쇄 (부모참여수업 현장에서 실물 그림책 만들기용)
   */
  static printBook(pages) {
    // 새 창에 인쇄 전용 뷰 렌더링
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('팝업 차단을 해제해 주세요.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>그림책 인쇄</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .page-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-after: always;
          }
          .page-container:last-child {
            page-break-after: auto;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        ${pages.map(p => `
          <div class="page-container">
            <img src="${p.canvas.toDataURL('image/jpeg', 0.95)}" />
          </div>
        `).join('')}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
