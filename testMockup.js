const {PDFDocument, TextAlignment} = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const fontkit = require('@pdf-lib/fontkit');

async function fillAttach53(headerFooterValues, attachValues) {
    console.log('-- fillAttach53 --');
    const formBuf = fs.readFileSync('./forms/03.attach53.pdf');
    const pdfDoc = await PDFDocument.load(formBuf);
    pdfDoc.registerFontkit(fontkit);
    const THSarabunNew = fs.readFileSync(path.join(__dirname, 'assets', 'fonts', 'THSarabunNew.ttf'));
    const THSarabunNewBold = fs.readFileSync(path.join(__dirname, 'assets', 'fonts', 'THSarabunNew-Bold.ttf'));
    const form = pdfDoc.getForm();
    const fNormal = await pdfDoc.embedFont(THSarabunNew);
    const fBold = await pdfDoc.embedFont(THSarabunNewBold);

    function generateMockData(count) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push({
                id: (i + 1).toString(),
                payeeTaxId: "1  2 3  4  5 6 7  8 9 0 1 2  3",
                payeeName: `John Doe ${i + 1}`,
                payeeAddress: `123 Main St, Apt ${i + 1}, Bangkok`,
                subsidiariesBranch: "00001",
                items: [
                    {
                        taxWHDocDate: "01/01/2024",
                        taxWHDesc: "Salary",
                        taxWHBaseAmount: "50000.00",
                        taxWHAmount: "5000.00"
                    },
                    {
                        taxWHDocDate: "15/01/2024",
                        taxWHDesc: "Bonus",
                        taxWHBaseAmount: "10000.00",
                        taxWHAmount: "1000.00"
                    }
                ],
                taxWHCode: "1",
                taxWHCondition: "1"
            });
        }
        return data;
    }

    const mockData = generateMockData(43);
    //console.log("🚀 ~ fillAttach53 ~ mockData:", mockData)

    function assignDataToTextFields(data) {
        const details = {};
        let currentPage = 1;
        
        data.forEach((item, index) => {
            const rowNumber = (index % 6) + 1;
            
            // Signal for a new page if we're starting a new set of 6 rows
            if (index > 0 && index % 6 === 0) {
                currentPage++;
            }
            
            const pagePrefix = `Page${currentPage}_`;
            
            details[`${pagePrefix}Text${rowNumber}.4`] = item.id;
            details[`${pagePrefix}Text${rowNumber}.5`] = item.payeeTaxId;
            details[`${pagePrefix}Text${rowNumber}.6`] = item.payeeName;
            
            const addressParts = item.payeeAddress.split(',');
            details[`${pagePrefix}Text${rowNumber}.7`] = addressParts[0].trim();
            details[`${pagePrefix}Text${rowNumber}.8`] = addressParts[1] ? addressParts[1].trim() : '';
            details[`${pagePrefix}Text${rowNumber}.9`] = item.subsidiariesBranch;
            
            item.items.forEach((subItem, subIndex) => {
                if (subIndex > 2) return; // Only process up to 3 sub-items per row
                
                const baseField = 10 + subIndex * 6;
                details[`${pagePrefix}Text${rowNumber}.${baseField}`] = subItem.taxWHDocDate;
                details[`${pagePrefix}Text${rowNumber}.${baseField + 1}`] = subItem.taxWHDesc;
                details[`${pagePrefix}Text${rowNumber}.${baseField + 2}`] = item.taxWHCode;
                details[`${pagePrefix}Text${rowNumber}.${baseField + 3}`] = subItem.taxWHBaseAmount;
                details[`${pagePrefix}Text${rowNumber}.${baseField + 4}`] = subItem.taxWHAmount;
                details[`${pagePrefix}Text${rowNumber}.${baseField + 5}`] = item.taxWHCondition;
            });
        });
        
        return details;
    }

    const details = assignDataToTextFields(mockData);

    const fieldConfigs = {
        "default": {font: fNormal, fontSize: 12},
        "Text1.0": {font: fNormal, fontSize: 12, alignment: TextAlignment.Center},
        "Text1.1": {font: fNormal, fontSize: 12, alignment: TextAlignment.Center},
    };

    let currentPage = 1;
    let pdfPage = pdfDoc.getPages()[0];

    for (const [key, value] of Object.entries(details)) {
        const [pagePrefix, fieldName] = key.split('_');
        const pageNumber = parseInt(pagePrefix.replace('Page', ''));

        if (pageNumber !== currentPage) {
            currentPage = pageNumber;
            const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [0]);
            pdfPage = pdfDoc.addPage(copiedPage);
        }

        const config = fieldConfigs[fieldName] || fieldConfigs.default;
        const field = form.getTextField(fieldName);
        
        if (field) {
            field.setText(value);
            if (config.fontSize) field.setFontSize(config.fontSize);
            if (config.alignment) {
                field.setAlignment(config.alignment);
            }
            field.updateAppearances(config.font || fNormal);
        }
    }

    // Add header and footer to each page
    pdfDoc.getPages().forEach((page, index) => {
        const pageForm = pdfDoc.getForm();
        const pageNumber = index + 1;
        const totalPages = pdfDoc.getPageCount();

        // Header
        pageForm.getTextField('Text1.0').setText("0 6355 57000 22 9");
        pageForm.getTextField('Text1.1').setText("00000");
        pageForm.getTextField('Text1.2').setText(pageNumber.toString());
        pageForm.getTextField('Text1.3').setText(totalPages.toString());

        // Footer (only on the last page)
        if (index === pdfDoc.getPageCount() - 1) {
            pageForm.getTextField('Text6.28').setText("7,823,213.21");
            pageForm.getTextField('Text6.29').setText("26,345,987.96");
            pageForm.getTextField('Text9.1').setText("name");
            pageForm.getTextField('Text9.2').setText("position");
            pageForm.getTextField('Text9.3').setText("07");
            pageForm.getTextField('Text9.4').setText("10");
            pageForm.getTextField('Text9.5').setText("2567");
        }
    });

    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const outputPath = path.join(outputDir, '03.attach53_multipage.pdf');
    form.flatten();
    const fillFormBuf = await pdfDoc.save();
    fs.writeFileSync(outputPath, fillFormBuf);
    console.log('PDF file written to', outputPath);
}

fillAttach53();