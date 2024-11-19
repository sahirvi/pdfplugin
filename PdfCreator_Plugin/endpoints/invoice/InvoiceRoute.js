var express = require('express')
var router = express.Router()
var invoiceService = require('./InvoiceService')

/* CREATE: route to generate invoice pdf */
router.post('/createPDF', function (req, res, next) {
  console.log('InvoiceRoute: ' + req.body)
  if (req.body) {
    invoiceService.generatePDF(req.body).then(result => {
      res.send(result)
    })
      .catch(err => {
        res.send(err)
      })
  }
  else {
    console.log('Error: No JSON Body')
  }
})

module.exports = router