const {PDFDocument, TextAlignment} = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const fontkit = require('@pdf-lib/fontkit');

/*
header
{
    currentPage,
    totalPage,
    taxCollectorId,
    branchId,
}
footer
{
    totalBaseAmount,
    totalTaxAmount,
    signName,
    signPosition,
    signDate,
    signMonth,
    signYear,
}
* */
async function fillAttach53(header, footer, rows) {
    // console.log(rows)
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
    let sequence = getSequence(header.currentPage);
    console.log("sequence", sequence)

    const details = rows.map((row, index) => {
        const idx = index + 1;
        return {
            [`Text${idx}.4`]: String(sequence++),
            [`Text${idx}.5`]: formatTaxPayerID(row.payeeTaxId),
            [`Text${idx}.6`]: row.payeeName,
            [`Text${idx}.7`]: row.payeeAddress.length > 70 ? row.payeeAddress.substring(0, 70) : row.payeeAddress,
            [`Text${idx}.8`]: row.payeeAddress.length > 50 ? row.payeeAddress.substring(70) : '',
            [`Text${idx}.9`]: String(row.subsidiariesBranch),

            [`Text${idx}.10`]: row.items[0] ? formatDate(row.docDate) : '',
            [`Text${idx}.11`]: row.items[0]?.taxWHDesc || "",
            [`Text${idx}.12`]: row.items[0] ? "3" : "", // TODO: change to อัตราภาษีร้อยละ
            [`Text${idx}.13`]: row.items[0]?.taxWHBaseAmount || "",
            [`Text${idx}.14`]: row.items[0]?.taxWHAmount || "",
            [`Text${idx}.15`]: row.items[0] ? row.taxWHCondition : "",

            [`Text${idx}.16`]: row.items[1] ? formatDate(row.docDate) : '',
            [`Text${idx}.17`]: row.items[1]?.taxWHDesc || "",
            [`Text${idx}.18`]: row.items[1] ? "3" : "", // TODO: change to อัตราภาษีร้อยละ
            [`Text${idx}.19`]: row.items[1]?.taxWHBaseAmount || "",
            [`Text${idx}.20`]: row.items[1]?.taxWHAmount || "",
            [`Text${idx}.21`]: row.items[1] ? row.taxWHCondition : "",

            [`Text${idx}.22`]: row.items[2] ? formatDate(row.docDate) : '',
            [`Text${idx}.23`]: row.items[2]?.taxWHDesc || "",
            [`Text${idx}.24`]: row.items[2] ? "3" : "", // TODO: change to อัตราภาษีร้อยละ
            [`Text${idx}.25`]: row.items[2]?.taxWHBaseAmount || "",
            [`Text${idx}.26`]: row.items[2]?.taxWHAmount || "",
            [`Text${idx}.27`]: row.items[2] ? row.taxWHCondition : "",
        }
    }).reduce((acc, curr) => {
        return {...acc, ...curr}
    })

    const fieldValues = {
        // header
        "Text1.0": formatTaxCollectorId(header.taxCollectorId),
        "Text1.1": header.branchId,
        "Text1.2": String(header.currentPage),
        "Text1.3": String(header.totalPage),

        // footer
        "Text6.28": String(footer.totalBaseAmount),
        "Text6.29": String(footer.totalTaxAmount),
        "Text9.1": footer.signName,
        "Text9.2": footer.signPosition,
        "Text9.3": String(footer.signDate),
        "Text9.4": String(footer.signMonth),
        "Text9.5": String(footer.signYear),
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
    form.flatten();
    return await pdfDoc.save();
}


function formatTaxPayerID(id) {
    const characters = id.split('');
    return `${characters[0]}  ${characters[1]} ${characters[2]}  ${characters[3]} ${characters[4]} ${characters[5]}  ${characters[6]}  ${characters[7]} ${characters[8]} ${characters[9]} ${characters[10]} ${characters[11]}  ${characters[12]}`;
}

function formatTaxCollectorId(id) {
    const characters = id.split('');
    return `${characters[0]} ${characters[1]}${characters[2]}${characters[3]}${characters[4]} ${characters[5]}${characters[6]}${characters[7]}${characters[8]}${characters[9]} ${characters[10]}${characters[11]} ${characters[12]}`;
}

function formatDate(date) {
    const d = new Date(date._seconds * 1000);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function getSequence(n) {
    return 1 + (n - 1) * 6;
}

function parFloatString(str) {
    return Number(str.replace(/,/g, ''));
}

function formatNumber(num) {
    const roundedNum = num.toFixed(2);
    const [integerPart, decimalPart] = roundedNum.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formattedInteger}.${decimalPart}`;
}

async function genDoc(data) {
    const header = {
        taxCollectorId: data[0].companyInfoTaxID,
        branchId: data[0].subsidiariesBranch,
    }
    const signDate = data[0].docWHTDate.split('/')[0]
    const signMonth = data[0].docWHTDate.split('/')[1]
    const signYear = data[0].docWHTDate.split('/')[2]
    const footer = {
        totalBaseAmount: formatNumber(data.reduce((acc, item) => acc + parFloatString(item.taxWHSumBaseAmount), 0)),
        totalTaxAmount: formatNumber(data.reduce((acc, item) => acc + parFloatString(item.taxWHSumAmount), 0)),
        signName: data[0]?.signName || '',
        signPosition: data[0]?.signPosition || '',
        signDate,
        signMonth,
        signYear
    }

    const dataChunk = []
    let i, j, temporary, chunk = 6
    for (i = 0, j = data.length; i < j; i += chunk) {
        temporary = data.slice(i, i + chunk)
        dataChunk.push(temporary)
    }

    const docBuffer = []
    for (let i = 0; i < dataChunk.length; i++) {
        docBuffer.push(await fillAttach53({
                ...header,
                currentPage: i + 1,
                totalPage: dataChunk.length,
            },
            footer,
            dataChunk[i]))
    }

    const pdfDoc = await PDFDocument.create()
    for (let i = 0; i < docBuffer.length; i++) {
        const pdfDocTemp = await PDFDocument.load(docBuffer[i])
        const copiedPages = await pdfDoc.copyPages(pdfDocTemp, pdfDocTemp.getPageIndices())
        copiedPages.forEach((page) => {
            pdfDoc.addPage(page)
        })
    }

    const pdfBytes = await pdfDoc.save()
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const outputPath = path.join(outputDir, '03.attach53.pdf');
    fs.writeFileSync(outputPath, pdfBytes);
}


const data = [{
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
}, {
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
}, {
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
}, {
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
    "taxWHSumAmount": "5,000.30",
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}]

genDoc(data)
