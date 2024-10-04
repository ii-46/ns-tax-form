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

 */
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

        // different pattern
        "Text2.27": "1",
        "Text2.1": "1 2345 67890 12 3",
        "Text2.2": "12345",
        "Text2.3": "John Doe",
        "Text2.4": "123 Main St",
        "Text2.5": "Apt 4B",
        "Text2.6": "01/01/2023",
        "Text2.7": "Salary",
        "Text2.8": "5%",
        "Text2.9": "1000.00",
        "Text2.10": "50.00",
        "Text2.11": "1",
        "Text2.12": "02/01/2023",
        "Text2.13": "Bonus",
        "Text2.14": "10%",
        "Text2.15": "500.00",
        "Text2.16": "50.00",
        "Text2.17": "1",
        "Text2.18": "03/01/2023",
        "Text2.19": "Commission",
        "Text2.20": "15%",
        "Text2.21": "200.00",
        "Text2.22": "30.00",
        "Text2.23": "1",
        "Text3.27": "1",
        "Text3.1": "1 2345 67890 12 3",
        "Text3.2": "12345",
        "Text3.3": "John Doe",
        "Text3.4": "123 Main St",
        "Text3.5": "Apt 4B",
        "Text3.6": "01/01/2023",
        "Text3.7": "Salary",
        "Text3.8": "5%",
        "Text3.9": "1000.00",
        "Text3.10": "50.00",
        "Text3.11": "1",
        "Text3.12": "02/01/2023",
        "Text3.13": "Bonus",
        "Text3.14": "10%",
        "Text3.15": "500.00",
        "Text3.16": "50.00",
        "Text3.17": "1",
        "Text3.18": "03/01/2023",
        "Text3.19": "Commission",
        "Text3.20": "15%",
        "Text3.21": "200.00",
        "Text3.22": "30.00",
        "Text3.23": "1",
        "Text4.27": "1",
        "Text4.1": "1 2345 67890 12 3",
        "Text4.2": "12345",
        "Text4.3": "John Doe",
        "Text4.4": "123 Main St",
        "Text4.5": "Apt 4B",
        "Text4.6": "01/01/2023",
        "Text4.7": "Salary",
        "Text4.8": "5%",
        "Text4.9": "1000.00",
        "Text4.10": "50.00",
        "Text4.11": "1",
        "Text4.12": "02/01/2023",
        "Text4.13": "Bonus",
        "Text4.14": "10%",
        "Text4.15": "500.00",
        "Text4.16": "50.00",
        "Text4.17": "1",
        "Text4.18": "03/01/2023",
        "Text4.19": "Commission",
        "Text4.20": "15%",
        "Text4.21": "200.00",
        "Text4.22": "30.00",
        "Text4.23": "1",
        "Text5.27": "1",
        "Text5.1": "1 2345 67890 12 3",
        "Text5.2": "12345",
        "Text5.3": "John Doe",
        "Text5.4": "123 Main St",
        "Text5.5": "Apt 4B",
        "Text5.6": "01/01/2023",
        "Text5.7": "Salary",
        "Text5.8": "5%",
        "Text5.9": "1000.00",
        "Text5.10": "50.00",
        "Text5.11": "1",
        "Text5.12": "02/01/2023",
        "Text5.13": "Bonus",
        "Text5.14": "10%",
        "Text5.15": "500.00",
        "Text5.16": "50.00",
        "Text5.17": "1",
        "Text5.18": "03/01/2023",
        "Text5.19": "Commission",
        "Text5.20": "15%",
        "Text5.21": "200.00",
        "Text5.22": "30.00",
        "Text5.23": "1",
        "Text6.27": "1",
        "Text6.1": "1 2345 67890 12 3",
        "Text6.2": "12345",
        "Text6.3": "John Doe",
        "Text6.4": "123 Main St",
        "Text6.5": "Apt 4B",
        "Text6.6": "01/01/2023",
        "Text6.7": "Salary",
        "Text6.8": "5%",
        "Text6.9": "1000.00",
        "Text6.10": "50.00",
        "Text6.11": "1",
        "Text6.12": "02/01/2023",
        "Text6.13": "Bonus",
        "Text6.14": "10%",
        "Text6.15": "500.00",
        "Text6.16": "50.00",
        "Text6.17": "1",
        "Text6.18": "03/01/2023",
        "Text6.19": "Commission",
        "Text6.20": "15%",
        "Text6.21": "200.00",
        "Text6.22": "30.00",
        "Text6.23": "1",
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
