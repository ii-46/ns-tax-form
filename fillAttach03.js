const {PDFDocument, TextAlignment} = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const fontkit = require('@pdf-lib/fontkit');


/*
const headerFooterValues = {
    // header
    "Text1.0": "เลขประจำ ตัวผู้เสียภาษีอากร (ของผู้มีหน้าที่หักภาษี ณ ที่จ่าย)",
    "Text1.1": "สาขาที",
    "Text1.2": "แผ่นที่",
    "Text1.3": "ในจำ นวน",

    // footer
    "Text6.24": "1", // รวมยอดเงินได้และภาษีที่นำ�ส่ง(นำ ไปรวมกับใบแนบ ภ.ง.ด.53 แผ่นอื่น (ถ้ามี)
    "Text6.25": "2", // รวมยอดเงินได้และภาษีที่นำ�ส่ง(นำ ไปรวมกับใบแนบ ภ.ง.ด.53 แผ่นอื่น (ถ้ามี)
    "Text9.1": "ลงชื่อ",
    "Text9.2": "ตำ�แหน่ง",
    "Text9.3": "ยื่นวันที่",
    "Text9.4": "เดือน",
    "Text9.5": "พ.ศ",
}
const detailsItem = {
    "Text1.27": "ำ�ดับที",
    "Text1.4": "เลขประจำ ตัวผู้เสียภาษีอากร (ของผู้มีเงินได้)",
    "Text1.5": "ถ",
    "Text1.6": "ชื่อ",
    "Text1.7": "ชื่อสกุล",
    "Text1.8": "ที่อยู 2",
    "Text1.9": "ัน เดือน ปี ที่จ่าย",
    "Text1.10": "ประเภทเงินได้",
    "Text1.11": "อัตราภาษีร้อยละ",
    "Text1.12": "จำ นวนเงินที่จ่ายในครั้งน",
    "Text1.13": "ำ นวนเงินภาษีที่หักและนำ ส่งในครั้งน",
    "Text1.14": "งื่อนไข",
    "Text1.15": "ัน เดือน ปี ที่จ่าย",
    "Text1.16": "ประเภทเงินได้พึงประเมินที่จ่าย",
    "Text1.17": "อัตราภาษีร้อยละ",
    "Text1.18": "จำ นวนเงินที่จ่ายในครั้งน",
    "Text1.19": "ำ นวนเงินภาษีที่หักและนำ ส่งในครั้งน",
    "Text1.20": "งื่อนไข",
    "Text1.21": "ัน เดือน ปี ที่จ่าย",
    "Text1.22": "ประเภทเงินได้พึงประเมินที่จ่าย",
    "Text1.23": "อัตราภาษีร้อยละ",
    "Text1.24": "จำ นวนเงินที่จ่ายในครั้งน",
    "Text1.25": "ำ นวนเงินภาษีที่หักและนำ ส่งในครั้งน",
    "Text1.26": "งื่อนไข",
}
const detailsItem = {
    "Text2.27": "ำ�ดับที",
    "Text2.1": "เลขประจำ ตัวผู้เสียภาษีอากร (ของผู้มีเงินได้)",
    "Text2.2": "สาขาที่",
    "Text2.3": "ชื่อ",
    "Text2.4": "ชื่อสกุล",
    "Text2.5": "ที่อยู 2",
    "Text2.6": "ัน เดือน ปี ที่จ่าย",
    "Text2.7": "ประเภทเงินได้",
    "Text2.8": "อัตราภาษีร้อยละ",
    "Text2.9": "จำ นวนเงินที่จ่ายในครั้งน",
    "Text2.10": "ำ นวนเงินภาษีที่หักและนำ ส่งในครั้งน",
    "Text2.11": "งื่อนไข",
    "Text2.12": "ัน เดือน ปี ที่จ่าย",
    "Text2.13": "ประเภทเงินได้พึงประเมินที่จ่าย",
    "Text2.14": "อัตราภาษีร้อยละ",
    "Text2.15": "จำ นวนเงินที่จ่ายในครั้งน",
    "Text2.16": "ำ นวนเงินภาษีที่หักและนำ ส่งในครั้งน",
    "Text2.17": "งื่อนไข",
    "Text2.18": "ัน เดือน ปี ที่จ่าย",
    "Text2.19": "ประเภทเงินได้พึงประเมินที่จ่าย",
    "Text2.20": "อัตราภาษีร้อยละ",
    "Text2.21": "จำ นวนเงินที่จ่ายในครั้งน",
    "Text2.22": "ำ นวนเงินภาษีที่หักและนำ ส่งในครั้งน",
    "Text2.23": "งื่อนไข",
}
 */


async function fillAttach03(headerFooterValues, attachValues) {
    console.log('-- fillAttach03 --');
    const formBuf = fs.readFileSync('./forms/05.attach03.pdf');
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
        "Text1.27": "1",
        "Text1.4": "1 2345 67890 12 3",
        "Text1.5": "12345",
        "Text1.6": "John Doe",
        "Text1.7": "123 Main St",
        "Text1.8": "Apt 4B",
        "Text1.9": "01/01/2023",
        "Text1.10": "Salary",
        "Text1.11": "5%",
        "Text1.12": "1000.00",
        "Text1.13": "50.00",
        "Text1.14": "1",
        "Text1.15": "02/01/2023",
        "Text1.16": "Bonus",
        "Text1.17": "10%",
        "Text1.18": "500.00",
        "Text1.19": "50.00",
        "Text1.20": "1",
        "Text1.21": "03/01/2023",
        "Text1.22": "Commission",
        "Text1.23": "15%",
        "Text1.24": "200.00",
        "Text1.25": "30.00",
        "Text1.26": "1",
    };

    const fieldValues = {
        // header
        "Text1.0": "0 6355 57000 22 9",
        "Text1.1": "00000",
        "Text1.2": "10",
        "Text1.3": "50",

        // footer
        "Text6.24": "1,453,54",
        "Text6.25": "54,665,46",
        "Text9.1": "ลงชื่อ",
        "Text9.2": "ตำแหน่ง",
        "Text9.3": "07",
        "Text9.4": "10",
        "Text9.5": "2567",
        ...details
    }

    const fieldConfigs = {
        "default": {font: fNormal, fontSize: 14},
        "Text1.0": {font: fNormal, fontSize: 14, alignment: TextAlignment.Center},
        "Text1.1": {font: fNormal, fontSize: 14, alignment: TextAlignment.Center},
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
    const outputPath = path.join(outputDir, '05.attach03.pdf');
    form.flatten();
    const fillFormBuf = await pdfDoc.save();
    fs.writeFileSync(outputPath, fillFormBuf);
    console.log('PDF file written to', outputPath);
}

fillAttach03();
