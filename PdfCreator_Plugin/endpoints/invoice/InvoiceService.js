const { jsPDF } = require('jspdf') // will automatically load the node version
const { jspdfautaoable } = require('jspdf-autotable')
const fs = require('fs')
const axios = require('axios')
var nodemailer = require('nodemailer')
require('dotenv').config()

var invoiceNumber

/* function to load image */
function base64_encode(file) {
  // read binary data (image)
  var bitmap = fs.readFileSync(file)
  // convert binary data to base64 encoded string
  return Buffer.from(bitmap).toString('base64')
}

/* function to send an email */
const sendMail = (email) => {
  // credentials to use own email address
  var transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    }
  })

  // mail options to send invoice as attachment with a message to email recipient
  var mailOptions = {
    from: 'sahiiram@yahoo.de',
    to: email,
    subject: 'Neue Rechnung von Ore Ore Ore ',
    text: 'Es liegt eine Rechnung von Ore Ore Ore vor.'
      + 'Per Klick auf den Button unten kann die Rechnung bezahlt, angezeigt oder gedruckt werden\n'
      + 'Viele Grüße,\nOre Ore Ore\noretimes3@gmail.com'
    ,
    attachments: [
      {
        filename: 'invoice.pdf',
        path: './invoice.pdf'
      }
    ]
  }

  // send Mail via transporter with mailOptions
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('email sent: ' + info.response)
    }
  })
}

// get the last invoice number from WIX database
const getInvoiceNumber = async () => {
  await axios.get(process.env.API_URL).then(resp => {
    invoiceNumber = parseInt(resp.data.invoiceNumber, 10)
    invoiceNumber += 1
  })
}

/* function to generate the invoice PDF */
const generatePDF = async data => {
  if (data) {
    await getInvoiceNumber()

    // dates
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]

    /* variables from the JSON Body */

    // dates
    var invoiceDate = new Date(data.order.dateCreated)
    var invoiceDateString = months[invoiceDate.getMonth()] + ' ' + invoiceDate.getDate() + ', ' + invoiceDate.getFullYear()

    var dueDate = new Date(data.order.billingInfo.paidDate)
    var dueDateString = months[dueDate.getMonth()] + ' ' + dueDate.getDate() + ', ' + dueDate.getFullYear()

    // billing and shipping data
    const billingName = data.order.billingInfo.address.fullName.firstName + ' ' + data.order.billingInfo.address.fullName.lastName
    const shippingName = data.order.shippingInfo.shipmentDetails.address.fullName.firstName + ' ' + data.order.shippingInfo.shipmentDetails.address.fullName.lastName
    let regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
    const billingAddress = data.order.billingInfo.address.zipCode + ', ' + data.order.billingInfo.address.city + '\n' + regionNames.of(data.order.billingInfo.address.country)
    const shippingAddress = data.order.shippingInfo.shipmentDetails.address.zipCode + ', ' + data.order.shippingInfo.shipmentDetails.address.city + '\n' + regionNames.of(data.order.shippingInfo.shipmentDetails.address.country)
    const phone = data.order.billingInfo.address.phone
    const email = data.order.billingInfo.address.email

    // totals
    var formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    })
    const subtotal = data.order.totals.subtotal
    const tax = data.order.totals.tax
    const shipping = data.order.totals.shipping
    const total = data.order.totals.total

    /* GENERATING THE PDF DOCUMENT */

    // new jsPDF document
    var doc = new jsPDF({ lineHeight: 1.2 })


    /* INVOICE DATA */
    doc.setFontSize(12).setFont('Helvetica', 'bold').setTextColor(51, 51, 51)
    doc.text('Invoice No.: ' + invoiceNumber, 195, 15, { align: 'right' }) // TODO: INVOICE number that needs to go +1 for every purchased item

    doc.setFontSize(9).setFont('Helvetica', 'normal')
    doc.text('Invoice Date: ' + invoiceDateString, 195, 20, { align: 'right' }) // date of invoice and date of required payment
    doc.text('Due Date: ' + dueDateString, 195, 24, { align: 'right' }) // date of invoice and date of required payment


    /* LOGO AND SELLER DATA  */
    var logo = base64_encode('logo.png')
    doc.addImage(logo, 'JPEG', 14, 9, 20, 20)

    doc.setFontSize(10).setFont('Helvetica', 'bold')
    doc.text('Ore Ore Ore', 14, 35,)

    doc.setFont('Helvetica', 'normal').setFontSize(9)
    doc.text('Stubenrauchstraße 47\n12161 Berlin\nGermany\noretimes3@gmail.com', 14, 40,)

    doc.setFontSize(9).setFont('Helvetica', 'bold').setTextColor('gray')
    doc.text('____________________________________________________________________________________________________', 14, 55).setFontSize(7).setTextColor('gray')


    /* CUSTOMER DATA */
    // BILL TO:
    doc.setFontSize(10).setFont('Helvetica', 'bold')
    doc.text('Bill to:', 14, 62)

    // customer billing name
    doc.setTextColor(51, 51, 51)
    doc.text(billingName, 14, 67)

    // customer billing address
    doc.setFont('Helvetica', 'normal').setFontSize(9)
    doc.text(billingAddress, 14, 71.5)

    // SHIP TO:
    doc.setFontSize(10).setFont('Helvetica', 'bold').setTextColor('gray')
    doc.text('Ship to:', 90, 62)

    // customer shipping name
    doc.setTextColor(51, 51, 51)
    doc.text(shippingName, 90, 67)

    // customer shipping address
    doc.setFont('Helvetica', 'normal').setFontSize(9)
    doc.text(shippingAddress, 90, 71.5)

    // ADDITIONAL CUSTOMER INFO:
    doc.setFontSize(10).setFont('Helvetica', 'bold').setTextColor('gray')
    doc.text('Additional Customer Info:', 145, 62).setFontSize(7)

    // customer email address and phone number
    doc.setFont('Helvetica', 'normal').setFontSize(9).setTextColor(51, 51, 51)
    doc.text(email + '\n' + phone, 145, 67)


    /* ITEMS TABLE */
    // generate a table from lineItems of data

    // push the elements from JSON.Body to the itemArray to use it for autoTable
    var itemArray = []

    data.order.lineItems.forEach(element => {
      itemArray.push([element.index, element.name, formatter.format(element.priceData.price), element.quantity, formatter.format(element.priceData.totalPrice)])
    })

    // column elements
    var col = ['Item. No.', 'Product or Service', 'Price', 'Quantity', 'Line Total']


    doc.autoTable(col, itemArray, {
      startY: 90,
      theme: 'grid',
      styles: {
        halign: 'left',
        font: 'Helvetica',
        fontSize: 11
      },
      headerStyles: {
        fillColor: [241, 0, 29],
      },
      margin: {
        top: 100
      },
      columnStyles: {
        0: { columnWidth: 20 },
        2: { columnWidth: 30 },
        3: { columnWidth: 20 },
        4: { columnWidth: 30, halign: 'right' }
      }
    })

    doc.setFontSize(11)

    // The y position on the page
    let finalY = doc.lastAutoTable.finalY

    /* TOTALS CALCULATION */
    doc.text('Subtotal', 107, finalY + 15)
    doc.text(formatter.format(subtotal), 195, finalY + 15, { align: 'right' })
    doc.text('Tax (0%)', 107, finalY + 23)
    doc.text(formatter.format(tax), 195, finalY + 23, { align: 'right' })
    doc.text('Shipping', 107, finalY + 31)
    doc.text(formatter.format(shipping), 195, finalY + 31, { align: 'right' })
    doc.setFont('Helvetica', 'bold').setTextColor('gray')
    doc.text('_________________________________________', 107, finalY + 38)
    doc.setFont('Helvetica', 'normal').setTextColor(51, 51, 51)
    doc.text('Total', 107, finalY + 48)
    doc.setFont('Helvetica', 'bold')
    doc.text(formatter.format(total), 195, finalY + 48, { align: 'right' })


    /* BANK INFORMATION */
    doc.setFontSize(9)
    doc.text('Bank Details', 15, finalY + 65)
    doc.setFont('Helvetica', 'normal')
    doc.text('IBAN DE59 1001 0010 0692 0321 19', 15, finalY + 70)
    doc.text('BIC PBNKDEFFXXX', 15, finalY + 75)
    doc.text('Bank: ZVC FK 22 Postbank NDL der DB Privat- und Firmenkundenbank', 15, finalY + 80)


    /* LEGAL INFORMATION */
    doc.setFont('Helvetica', 'bold')
    doc.text('Legal', 15, finalY + 90)
    doc.setFont('Helvetica', 'normal').setFontSize(9)
    doc.text('Steuer Nr.: 18/465/01021', 15, finalY + 95)

    // save the document as invoice.pdf
    doc.save('invoice.pdf')
    sendMail(email)
    return Promise.resolve('pdf created and email sent to: ' + email)
  }
  else {
    return Promise.reject('no data to create PDF')
  }
}


module.exports = {
  generatePDF
}