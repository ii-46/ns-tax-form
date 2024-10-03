const { PDFDocument, rgb, TextAlignment , StandardFonts  } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const fontkit = require('@pdf-lib/fontkit');
const https = require('https');

const modifyPdf = async () => {
  try {

    const fetchPdf = (url) => {
      return new Promise((resolve, reject) => {
        https.get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to load PDF: ${response.statusCode}`));
            return;
          }

          const data = [];
          response.on('data', (chunk) => data.push(chunk));
          response.on('end', () => resolve(Buffer.concat(data)));
        }).on('error', reject);
      });
    };

    // Load the existing PDF
    const pdfBytes = fs.readFileSync('approve_wh3_081156.pdf');

    // const pdfUrl = 'https://firebasestorage.googleapis.com/v0/b/sld-etax.appspot.com/o/Users%2FDTRnq2huePWrzlqVh3KxdHp6W383%2FTestPDF%2Fapprove_wh3_081156.pdf?alt=media&token=1ea8807d-200e-4fa9-83d2-8ffea62d2a00';
    // const pdfBytes = await fetchPdf(pdfUrl);
    // console.log("🚀 ~ modifyPdf ~ pdfBytes:", pdfBytes)
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // Get the form
    const form = pdfDoc.getForm();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

  

    // List all fields and their names
    const fields = form.getFields();

    let taxWHCode = 4 
    let taxWHCondition = 1
    fields.forEach(field => {
     console.log(`Field name: ${field.getName()}`);
      // Work with checkboxes from chk4 to chk11
         const chk = field.getName()
         switch (chk) {
           case 'chk4':
             const chkfrm4 = form.getCheckBox(chk)
             chkfrm4[taxWHCode != 4 ? 'uncheck' : 'check']()
             console.log(' ภ.ง.ด 3')
             break;
           case 'chk7':
             const chkfrm7 = form.getCheckBox(chk)
             chkfrm7[taxWHCode != 7 ? 'uncheck' : 'check']()
             console.log(' ภ.ง.ด 53')
             break
           case 'chk8':
             const chkfrm8 = form.getCheckBox(chk)
             chkfrm8[taxWHCondition != 1 ? 'uncheck' : 'check']()
             console.log('หัก ณ ที่จ่าย')
             break
           case 'chk9':
             const chkfrm9 = form.getCheckBox(chk)
             chkfrm9[taxWHCondition != 2 ? 'uncheck' : 'check']()
             console.log('ออกให้ตลอดไป')
             break
           case 'chk10':
             const chkfrm10 = form.getCheckBox(chk)
             chkfrm10[taxWHCondition != 3 ? 'uncheck' : 'check']()
             console.log('ออกให้ครั้งเดียว')
             break
           case 'chk11':
             const chkfrm11 = form.getCheckBox(chk)
             chkfrm11[taxWHCondition != 4 ? 'uncheck' : 'check']()
             console.log('ออกให้ครั้งเดียว')
             break
           default:
             break;
         }
    });

    // Work with field type text
    const fieldValues = {

      'run_no': '00007-532409100014',

      'id1': '1234567898091', 
      'name1': 'บริษัท ทดสอบ Thai Smart Tax (Dev)', 
      'add1': 'เลขที่ 121 เพลินจิต ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110',

      'pay1.13.0': '12349.59',
      'pay1.13.1': '123449.79',
      'tax1.13.0': '12349.59',
      'tax1.13.1': '123449.79',
      'date14.0': '24/11/2566',
      'date14.1': '24/11/2566',
      'pay1.14': '19.79',
      'tax1.14': '19.79',

      'name2': 'บริษัท เสาทอง จำกัด',
      'add2': 'เลขที่ 81/14 ถนนสุขสวัสดิ์ แขวงราษฎร์บูรณะ เขตราษฎร์บูรณะ กรุงเทพมหานคร 10140',
      'id1_2': '1234567898091',

      'total': 'หกสิบบาทถ้วน',

      'date_pay': '25',
      'month_pay': 'มีนาคม',
      'year_pay': '2566',

      'spec4' : '' ,
      'spec3': ''
    };
    const THSarabunNew = fs.readFileSync(path.join(__dirname, 'assets',  'fonts', 'THSarabunNew.ttf'));
    const THSarabunNewBold = fs.readFileSync(path.join(__dirname, 'assets', 'fonts', 'THSarabunNew-Bold.ttf'));
    
    
        const font = await pdfDoc.embedFont(THSarabunNew);
        const fontBold = await pdfDoc.embedFont(THSarabunNewBold);
    

        const fieldConfigs = {
          default: { fontSize: 12, font: font },
          name1: { fontSize: 12, font: font}, 
          add1: { fontSize: 12, font: font}, 
          name2: { fontSize: 12, font: font}, 
          add2: { fontSize: 12, font: font},
          total: { fontSize: 14, alignment: TextAlignment.Center },
          run_no: { fontSize: 12.4 },
          year_pay: {fontSize: 13, alignment: TextAlignment.Center, font: fontBold },
          month_pay: {fontSize: 13, alignment: TextAlignment.Center, font: fontBold },
          date_pay: {fontSize: 13, alignment: TextAlignment.Center, font: fontBold },
          id1: { fontSize: 15, formatter: formatID , font: font },
          id1_2: { fontSize: 15, formatter: formatID , font: font },
          'date14.0': { fontSize: 12, font: fontBold },
          'date14.1': { fontSize: 12, font: fontBold },
          'pay1.13.0': { fontSize: 12, font: fontBold },
          'pay1.13.1': { fontSize: 12, font: fontBold },
          'tax1.13.0': { fontSize: 12, font: fontBold },
          'tax1.13.1': { fontSize: 12, font: fontBold },
          'pay1.14': { fontSize: 12, font: fontBold },
          'tax1.14': { fontSize: 12, font: fontBold },
        };
    
        function formatID(value) {
          return (value && value.length <= 13) 
            ? `${value[0]} ${value.slice(1, 5)} ${value.slice(5, 10)} ${value.slice(10, 12)} ${value.slice(12)}`
            : '';
        }
        
        for (const [fieldName, value] of Object.entries(fieldValues)) {
          const field = form.getTextField(fieldName);
          if (!field) {
            console.log(`Field "${fieldName}" not found.`);
            continue;
          }
        
          const config = fieldConfigs[fieldName] || fieldConfigs.default;
          
          field.setText(config.formatter ? config.formatter(value) : value);
          if (config.fontSize) field.setFontSize(config.fontSize);
          if (config.alignment) field.setAlignment(config.alignment);
          field.updateAppearances(config.font || font);
        }
    


    // Save the updated PDF to the output directory
    const outputDir = './output';
    const outputPath = path.join(outputDir, 'approve_wh3_081156.pdf');
  
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
  
    // Flatten the form
    form.flatten();

    
    firstPage.drawRectangle({
      x: 400, 
      y: 800, 
      width: 200,
      height: 40, 
      color: rgb(1, 1, 1), 
    });

    // Write the modified PDF to the output file
    
    const pdfBytesOut = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytesOut);
  
    console.log(`PDF saved to ${outputPath}`);
  } catch (error) {
    console.error('Error modifying PDF:', error);
  }
};

modifyPdf();
