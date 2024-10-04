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
        "Text1.4": "2 12 1 212 12121 1",
        "Text1.5": "1234567890123",
        "Text1.6": "John Doe",
        "Text1.7": "123 Main St",
        "Text1.8": "Apt 4B",
        "Text1.9": "00001",
        "Text1.10": "01/01/2023",
        "Text1.11": "Salary",
        "Text1.12": "5%",
        "Text1.13": "1000.00",
        "Text1.14": "50.00",
        "Text1.15": "1",
        "Text1.16": "02/01/2023",
        "Text1.17": "Bonus",
        "Text1.18": "10%",
        "Text1.19": "500.00",
        "Text1.20": "50.00",
        "Text1.21": "1",
        "Text1.22": "03/01/2023",
        "Text1.23": "Commission",
        "Text1.24": "15%",
        "Text1.25": "200.00",
        "Text1.26": "30.00",
        "Text1.27": "1",

        // 2
        "Text2.4": "2 12 1 212 12121 1",
        "Text2.5": "1234567890123",
        "Text2.6": "John Doe",
        "Text2.7": "123 Main St",
        "Text2.8": "Apt 4B",
        "Text2.9": "00001",
        "Text2.10": "01/01/2023",
        "Text2.11": "Salary",
        "Text2.12": "5%",
        "Text2.13": "1000.00",
        "Text2.14": "50.00",
        "Text2.15": "1",
        "Text2.16": "02/01/2023",
        "Text2.17": "Bonus",
        "Text2.18": "10%",
        "Text2.19": "500.00",
        "Text2.20": "50.00",
        "Text2.21": "1",
        "Text2.22": "03/01/2023",
        "Text2.23": "Commission",
        "Text2.24": "15%",
        "Text2.25": "200.00",
        "Text2.26": "30.00",
        "Text2.27": "1",

        // 3
        "Text3.4": "2 12 1 212 12121 1",
        "Text3.5": "1234567890123",
        "Text3.6": "John Doe",
        "Text3.7": "123 Main St",
        "Text3.8": "Apt 4B",
        "Text3.9": "00001",
        "Text3.10": "01/01/2023",
        "Text3.11": "Salary",
        "Text3.12": "5%",
        "Text3.13": "1000.00",
        "Text3.14": "50.00",
        "Text3.15": "1",
        "Text3.16": "02/01/2023",
        "Text3.17": "Bonus",
        "Text3.18": "10%",
        "Text3.19": "500.00",
        "Text3.20": "50.00",
        "Text3.21": "1",
        "Text3.22": "03/01/2023",
        "Text3.23": "Commission",
        "Text3.24": "15%",
        "Text3.25": "200.00",
        "Text3.26": "30.00",
        "Text3.27": "1",
        // 4
        "Text4.4": "2 12 1 212 12121 1",
        "Text4.5": "1234567890123",
        "Text4.6": "John Doe",
        "Text4.7": "123 Main St",
        "Text4.8": "Apt 4B",
        "Text4.9": "00001",
        "Text4.10": "01/01/2023",
        "Text4.11": "Salary",
        "Text4.12": "5%",
        "Text4.13": "1000.00",
        "Text4.14": "50.00",
        "Text4.15": "1",
        "Text4.16": "02/01/2023",
        "Text4.17": "Bonus",
        "Text4.18": "10%",
        "Text4.19": "500.00",
        "Text4.20": "50.00",
        "Text4.21": "1",
        "Text4.22": "03/01/2023",
        "Text4.23": "Commission",
        "Text4.24": "15%",
        "Text4.25": "200.00",
        "Text4.26": "30.00",
        "Text4.27": "1",
        // 5
        "Text5.4": "2 12 1 212 12121 1",
        "Text5.5": "1234567890123",
        "Text5.6": "John Doe",
        "Text5.7": "123 Main St",
        "Text5.8": "Apt 4B",
        "Text5.9": "00001",
        "Text5.10": "01/01/2023",
        "Text5.11": "Salary",
        "Text5.12": "5%",
        "Text5.13": "1000.00",
        "Text5.14": "50.00",
        "Text5.15": "1",
        "Text5.16": "02/01/2023",
        "Text5.17": "Bonus",
        "Text5.18": "10%",
        "Text5.19": "500.00",
        "Text5.20": "50.00",
        "Text5.21": "1",
        "Text5.22": "03/01/2023",
        "Text5.23": "Commission",
        "Text5.24": "15%",
        "Text5.25": "200.00",
        "Text5.26": "30.00",
        "Text5.27": "1",
        // 3
        "Text6.4": "2 12 1 212 12121 1",
        "Text6.5": "1234567890123",
        "Text6.6": "John Doe",
        "Text6.7": "123 Main St",
        "Text6.8": "Apt 4B",
        "Text6.9": "00001",
        "Text6.10": "01/01/2023",
        "Text6.11": "Salary",
        "Text6.12": "5%",
        "Text6.13": "1000.00",
        "Text6.14": "50.00",
        "Text6.15": "1",
        "Text6.16": "02/01/2023",
        "Text6.17": "Bonus",
        "Text6.18": "10%",
        "Text6.19": "500.00",
        "Text6.20": "50.00",
        "Text6.21": "1",
        "Text6.22": "03/01/2023",
        "Text6.23": "Commission",
        "Text6.24": "15%",
        "Text6.25": "200.00",
        "Text6.26": "30.00",
        "Text6.27": "1",
    };

    const fieldValues = {
        // header
        "Text1.0": "0 6355 57000 22 9",
        "Text1.1": "00000",
        "Text1.2": "10",
        "Text1.3": "50",

        // footer
        "Text6.28": "7,823.213.21", // รวมยอดเงินได้และภาษีที่นำ�ส่ง(นำ ไปรวมกับใบแนบ ภ.ง.ด.53 แผ่นอื่น (ถ้ามี)
        "Text6.29": "26,345,987.96", // รวมยอดเงินได้และภาษีที่นำ�ส่ง(นำ ไปรวมกับใบแนบ ภ.ง.ด.53 แผ่นอื่น (ถ้ามี)
        "Text9.1": "ลงชื่อ",
        "Text9.2": "ตำ�แหน่ง",
        "Text9.3": "07",
        "Text9.4": "10",
        "Text9.5": "2567",
        ...details
    }

    const fieldConfigs = {
        "default": {font: fNormal, fontSize: 14, alignment: TextAlignment.Center},
        "Text1.0": {font: fNormal, fontSize: 14, alignment: TextAlignment.Center},
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
            if (config.alignment) field.setAlignment(config.alignment);
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
