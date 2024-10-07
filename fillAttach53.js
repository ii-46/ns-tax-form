const {PDFDocument, TextAlignment} = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const fontkit = require('@pdf-lib/fontkit');


/*
const headerFooterValues = {
    // header
    "Text1.0": "เลขประจำ ตัวผู้เสียภาษีอากร (ของผู้มีหน้าที่หักภาษี ณ ที่จ่าย)",
    "Text1.1": "สาขาที",
    "Text1.2": "ชแผ่นที่",
    "Text1.3": "ในจำ นวน",

    // footer
    "Text6.28": "1", // รวมยอดเงินได้และภาษีที่นำ�ส่ง(นำ ไปรวมกับใบแนบ ภ.ง.ด.53 แผ่นอื่น (ถ้ามี)
    "Text6.29": "2", // รวมยอดเงินได้และภาษีที่นำ�ส่ง(นำ ไปรวมกับใบแนบ ภ.ง.ด.53 แผ่นอื่น (ถ้ามี)
    "Text9.1": "ลงชื่อ",
    "Text9.2": "ตำ�แหน่ง",
    "Text9.3": "ยื่นวันที่",
    "Text9.4": "เดือน",
    "Text9.5": "พ.ศ",
}

const detailsItem = {
    "Text1.4": "ำ�ดับที",

    // ชื่อและที่อยู่ของผู้มีเงินได้
    "Text1.5": "เลขประจำ ตัวผู้เสียภาษีอากร (ของผู้มีเงินได้)",
    "Text1.6": "ชื่อ",
    "Text1.7": "ที่อยู",
    "Text1.8": "ที่อยู 2",

    "Text1.9": "สาขาที่",
    // รายละเอียดเกี่ยวกับการจ่ายเงิน
    // 1
    "Text1.10": "ัน เดือน ปี ที่จ่าย",
    "Text1.11": "ประเภทเงินได้พึงประเมินที่จ่าย",
    "Text1.12": "อัตราภาษีร้อยละ",
    "Text1.13": "จำ นวนเงินที่จ่ายในครั้งน",
    "Text1.14": "ำ นวนเงินภาษีที่หักและนำ ส่งในครั้งน",
    "Text1.15": "งื่อนไข",
    // 2
    "Text1.16": "ัน เดือน ปี ที่จ่าย",
    "Text1.17": "ประเภทเงินได้พึงประเมินที่จ่าย",
    "Text1.18": "อัตราภาษีร้อยละ",
    "Text1.19": "จำ นวนเงินที่จ่ายในครั้งน",
    "Text1.20": "ำ นวนเงินภาษีที่หักและนำ ส่งในครั้งน",
    "Text1.21": "งื่อนไข",
    // 2
    "Text1.22": "ัน เดือน ปี ที่จ่าย",
    "Text1.23": "ประเภทเงินได้พึงประเมินที่จ่าย",
    "Text1.24": "อัตราภาษีร้อยละ",
    "Text1.25": "จำ นวนเงินที่จ่ายในครั้งน",
    "Text1.26": "ำ นวนเงินภาษีที่หักและนำ ส่งในครั้งน",
    "Text1.27": "งื่อนไข",
}
*/

const doc03 = {
    "payeeTaxId": "0105554567891",
    "taxWHCode": "1",
    "link": "https://8621541-SB1.app.netsuite.com/app/accounting/transactions/vendpymt.nl?id=5833&whence=",
    "taxWHSumAmountText": "หนึ่งร้อยห้าสิบบาทถ้วน",
    "paymentType": "B",
    "payeeName": "Ari Consulting Co.,Ltd",
    "taxWHSumBaseAmount": "5,000.00",
    "subsidiariesBranch": "00000",
    "taxWHCondition": "1",
    "documentID": "00000-0320430001",
    "timeCreated": {
        "_seconds": 1727692183,
        "_nanoseconds": 426000000
    },
    "companyAddressTST": null,
    "@PdfDefaultPath": "gs://sld-etax.appspot.com/NsPDF/approve_wh3_081156.pdf",
    "docDate": {
        "_seconds": 1725926400,
        "_nanoseconds": 0
    },
    "companyInfoTaxID": "0105556154812",
    "taxWHSumAmount": "5,000.00",
    "internalDocument": "To Be Generated",
    "transactionId": "To Be Generated",
    "transactionType": "Update",
    "payeeAddress": "เลขที่ 598 ชั้น 6 อาคารคิวเฮาส์เพลินจิต ถนนเพลินจิต แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330",
    "@PdfPath": "gs://sld-etax.appspot.com/Companies/qCp8p3s5hafVuAOBmutT/ThaiSmartTaxPdfs/00000-0320430001.pdf",
    "docWHTDate": "10/09/2024",
    "items": [
        {
            "taxWHDesc": "ค่าบริการ",
            "taxWHDocDate": "10/09/2024",
            "taxWHAmount": "150.00",
            "taxWHBaseAmount": "5,000.00"
        }
    ],
    "@PdfUrl": "https://firebasestorage.googleapis.com/v0/b/sld-etax.appspot.com/o/Companies%2FqCp8p3s5hafVuAOBmutT%2FThaiSmartTaxPdfs%2F00000-0320430001.pdf?alt=media&token=8549a722-f4dc-40a8-a034-dcb6e657a555",
    "companyInfoName": "Sala Daeng Co.,Ltd."
}

async function fillAttach53(headerFooterValues, attachValues) {
    console.log('-- fillAttach53 --');
    const formBuf = fs.readFileSync('./forms/03.attach53.pdf');
    const pdfDoc = await PDFDocument.load(formBuf);
    pdfDoc.registerFontkit(fontkit);
    const THSarabunNew = fs.readFileSync(path.join(__dirname, 'assets', 'fonts', 'THSarabunNew.ttf'));
    const THSarabunNewBold = fs.readFileSync(path.join(__dirname, 'assets', 'fonts', 'THSarabunNew-Bold.ttf'));
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const form = pdfDoc.getForm();
    const fNormal = await pdfDoc.embedFont(THSarabunNew);
    const fBold = await pdfDoc.embedFont(THSarabunNewBold);


    const details = {
        "Text1.4": "1",
        "Text1.5": "0  1 0  5  5 5 4  5 6 7 8 9  1",
        "Text1.6": "Ari Consulting Co.,Ltd",
        "Text1.7": "เลขที่ 598 ชั้น 6 อาคารคิวเฮาส์เพลินจิต ถนนเพลินจิต แขวงลุมพินี เขตปทุมวัน",
        "Text1.8": "กรุงเทพมหานคร 10330",
        "Text1.9": "00000",
        "Text1.10": "10/09/2024",
        "Text1.11": "ค่าบริการ",
        "Text1.12": "3",
        "Text1.13": "5,000.00",
        "Text1.14": "150.00",
        "Text1.15": "1",
        "Text2.4": "1",
    };

    const fieldValues = {
        // header
        "Text1.0": "0 1055 56154 81 2",
        "Text1.1": "00000",
        "Text1.2": "1",
        "Text1.3": "1",

        // footer
        "Text6.28": "5,000.00", // รวมยอดเงินได้และภาษีที่นำ�ส่ง(นำ ไปรวมกับใบแนบ ภ.ง.ด.53 แผ่นอื่น (ถ้ามี)
        "Text6.29": "150.00", // รวมยอดเงินได้และภาษีที่นำ�ส่ง(นำ ไปรวมกับใบแนบ ภ.ง.ด.53 แผ่นอื่น (ถ้ามี)
        "Text9.1": "",
        "Text9.2": "",
        "Text9.3": "09",
        "Text9.4": "10",
        "Text9.5": "2567",
        ...details
    }

    const fieldConfigs = {
        "default": {font: fNormal, fontSize: 12},
        "Text1.0": {font: fNormal, fontSize: 12, alignment: TextAlignment.Center},
        "Text1.1": {font: fNormal, fontSize: 12, alignment: TextAlignment.Center},
    };
    for (const [key, value] of Object.entries(fieldValues)) {
        const isRadio = key.startsWith('Radio Button');
        const isText = key.startsWith('Text');
        const config = fieldConfigs[key] || fieldConfigs.default;
        console.log(key)
        if (isRadio) {
            const field = form.getRadioGroup(key);
            console.log('Options:', field.getOptions());
            field.select(value);
        }
        if (isText) {
            const field = form.getTextField(key);
            field.setText(value);
            if (config.fontSize) field.setFontSize(config.fontSize);
            if (config.alignment) {
                field.setAlignment(config.alignment);
            } /*else {
                field.setAlignment(TextAlignment.Center);
            }*/

            field.updateAppearances(config.font || fNormal);
        }
    }
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const outputPath = path.join(outputDir, '03.attach53.pdf');
    form.flatten();
    const fillFormBuf = await pdfDoc.save();
    fs.writeFileSync(outputPath, fillFormBuf);
    console.log('PDF file written to', outputPath);
}

fillAttach53();
