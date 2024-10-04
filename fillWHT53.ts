import {
    AppearanceMapping,
    defaultTextFieldAppearanceProvider,
    drawTextField,
    PDFOperator,
    PDFTextField, setFillingColor,
    setFillingRgbColor
} from "pdf-lib";

const {PDFDocument, rgb, TextAlignment, StandardFonts} = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const fontkit = require('@pdf-lib/fontkit');
const https = require('https');

/*
{
    "Text1.0": "เลขประจำ ตัวผู้เสียภาษีอากร",
    "Text1.1": "สาขาที",
    "Text1.2": "ชื่อผู้มีหน้าที่หักภาษี ณ ที่จ่าย",
    "Text1.3": "ี่อยู่ : อาคาร",
    "Text1.4": "้องเลขที่.",
    "Text1.5": "ชั้นที่",
    "Text1.6": "หมู่บ้าน",
    "Text1.7": "เลขท",
    "Text1.8": "หมู่ที",
    "Text1.9": "ตรอก/ซอย",
    "Text1.10": "แยก",
    "Text1.11": "ถนน",
    "Text1.12": "ตำ บล/แขวง",
    "Text1.13": "อำ เภอ/เขต",
    "Text1.14": "ังหวัด",
    "Text1.15": "รหัสไปรษณีย",
    "Text1.16": "รหัสไปรษณีย",
    "Text1.17": "หน้าชื่อเดือน) พ.ศ",
    "Radio Button10": "เดือนที่จ่ายเงินได้พึงประเมิน (",
    "Radio Button0": "นำ ส่งภาษีตาม 1 2 3",
    "Radio Button2": "ยื่นปกติ ยื่นเพิ่มเติมครั้งที",
    "Radio Button3": "ใบแนบ หรือ สื่อบันทึก",
    "Text1.19": "ใบแนบ จำ นวน ราย",
    "Text1.20": "ใบแนบ จำ นวน แผ่น",
    "Text1.21": "ใบแนบ จำ นวน ราย 2",
    "Text1.22": "ใบแนบ จำ นวน แผ่น 2",
    "Text1.23": "ทะเบียนรับเลขที",
    "Text1.24": " เลขอ้างอิงการลงทะเบียน",
    "Text2.1": "1.รวมยอดเงินได้ทั้งสิ้น .",
    "Text2.2": "2.รวมยอดภาษีที่นำส่งทั้งสิ้น",
    "Text2.3": "3. เงินเพิ่ม (ถ้ามี)",
    "Text2.4": "รวมยอดภาษีที่นำส่งทั้งสิ้น และเงินเพิ่ม (2. + 3.)",
    "Text2.23": "ลงชื่อ ผู้จ่ายเงิน",
    "Text2.24": "ตำแหน่ง..",
    "Text2.25": "ยื่นวันท",
    "Text2.26": "เดือน",
    "Text2.27": "พ.ศ.",
}
*/


async function fillWHT53() {
    console.log('fillWHT53');
    const formBuf = fs.readFileSync('./forms/02.WHT53.pdf');
    const pdfDoc = await PDFDocument.load(formBuf);
    pdfDoc.registerFontkit(fontkit);
    const THSarabunNew = fs.readFileSync(path.join(__dirname, 'assets', 'fonts', 'THSarabunNew.ttf'));
    const THSarabunNewBold = fs.readFileSync(path.join(__dirname, 'assets', 'fonts', 'THSarabunNew-Bold.ttf'));
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const form = pdfDoc.getForm();
    const fNormal = await pdfDoc.embedFont(THSarabunNew);
    const fBold = await pdfDoc.embedFont(THSarabunNewBold);
    const fieldValues = {
        "Text1.0": "0 6355 57000 22 9",
        "Text1.1": "00000",
        "Text1.2": "บริษัท บุญรักษาบรรจุภัณฑ์ จำกัด",
        "Text1.3": "MM Tower",
        "Text1.4": "999/9",
        "Text1.5": "9",
        "Text1.6": "บุญรักษา",
        "Text1.7": "999",
        "Text1.8": "9",
        "Text1.9": "9/2",
        "Text1.10": "9",
        "Text1.11": "ถนน",
        "Text1.12": "แขวง บางรัก",
        "Text1.13": "เขต บางรัก",
        "Text1.14": "กรุงเทพมหานคร",
        "Text1.15": "63110",
        "Text1.16": "",
        "Text1.17": "ก.ย",
        "Radio Button10": "1",
        "Radio Button0": "1",
        "Radio Button2": "1",
        "Radio Button3": "1",
        "Text1.18": "5",
        "Text1.19": "50",
        "Text1.20": "4",
        "Text1.21": "30",
        "Text1.22": "3",
        "Text1.23": "2",
        "Text1.24": " 1232321",
        "Text2.1": "2,320,323.00",
        "Text2.2": "2,320,323.22",
        "Text2.3": "2,320,323.45",
        "Text2.4": "324,324.23",
        "Text2.23": "ลงชื่อ ผู้จ่ายเงิน",
        "Text2.24": "ตำแหน่ง..",
        "Text2.25": "03",
        "Text2.26": "07",
        "Text2.27": "พ.ศ.",
    }

    const fieldConfigs = {
        "default": {font: fNormal, fontSize: 12},
        "Text1.0": {font: fNormal, fontSize: 12, alignment: TextAlignment.Center},
        "Text1.1": {font: fNormal, fontSize: 12},
        "Text1.2": {font: fNormal, fontSize: 12},
        "Text1.3": {font: fNormal, fontSize: 12},
        "Text1.4": {font: fNormal, fontSize: 12},
        "Text1.5": {font: fNormal, fontSize: 12},
        "Text1.6": {font: fNormal, fontSize: 12},
        "Text1.7": {font: fNormal, fontSize: 12},
        "Text1.8": {font: fNormal, fontSize: 12},
        "Text1.9": {font: fNormal, fontSize: 12},
        "Text1.10": {font: fNormal, fontSize: 12},
        "Text1.11": {font: fNormal, fontSize: 12},
        "Text1.12": {font: fNormal, fontSize: 12},
        "Text1.13": {font: fNormal, fontSize: 12},
        "Text1.14": {font: fNormal, fontSize: 12},
        "Text1.15": {font: fNormal, fontSize: 12, alignment: TextAlignment.Center},
        "Text1.16": {font: fNormal, fontSize: 12},
        "Text1.17": {font: fNormal, fontSize: 12},
        "Radio Button10": {font: fNormal, fontSize: 12},
        "Radio Button0": {font: fNormal, fontSize: 12},
        "Radio Button2": {font: fNormal, fontSize: 12},
        "Radio Button3": {font: fNormal, fontSize: 12},
        "Text1.18": {font: fNormal, fontSize: 12},
        "Text1.19": {font: fNormal, fontSize: 12},
        "Text1.20": {font: fNormal, fontSize: 12},
        "Text1.21": {font: fNormal, fontSize: 12},
        "Text1.22": {font: fNormal, fontSize: 12},
        "Text1.23": {font: fNormal, fontSize: 12},
        "Text1.24": {font: fNormal, fontSize: 12},
        "Text2.1": {font: fNormal, fontSize: 14, alignment: TextAlignment.Right},
        "Text2.2": {font: fNormal, fontSize: 14, alignment: TextAlignment.Right},
        "Text2.3": {font: fNormal, fontSize: 14, alignment: TextAlignment.Right},
        "Text2.4": {font: fNormal, fontSize: 14, alignment: TextAlignment.Right},
        "Text2.23": {font: fNormal, fontSize: 12},
        "Text2.24": {font: fNormal, fontSize: 12},
        "Text2.25": {font: fNormal, fontSize: 12},
        "Text2.26": {font: fNormal, fontSize: 12},
        "Text2.27": {font: fNormal, fontSize: 12},
    };
    for (const [key, value] of Object.entries(fieldValues)) {
        const isRadio = key.startsWith('Radio Button');
        const isText = key.startsWith('Text');
        const config = fieldConfigs[key] || fieldConfigs.default;
        console.log(key)
        if (isRadio) {
            const field = form.getRadioGroup(key);
            // console.log(field.acroField.getExportValues())
            // TODO: set export value in pdf form
            field.select(value);
        }
        if (isText) {
            const field: PDFTextField = form.getTextField(key);
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
    const outputPath = path.join(outputDir, '02.WHT53_filled.pdf');
    // form.flatten();
    const fillFormBuf = await pdfDoc.save();
    fs.writeFileSync(outputPath, fillFormBuf);
    console.log('PDF file written to', outputPath);
}

fillWHT53();

function formatID(value) {
    return (value && value.length <= 13)
        ? `${value[0]} ${value.slice(1, 5)} ${value.slice(5, 10)} ${value.slice(10, 12)} ${value.slice(12)}`
        : '';
}