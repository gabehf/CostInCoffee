/********* CONSTANTS AND GLOBAL VARS  *********/
const SubList = [
    'LinkedIn Premium',
    'Netflix',
    'Hulu',
    'Crunchyroll',
    'Youtube Premium',
    'Skillshare',
]

let subscriptions = []
let numSubs = 0
const pricePattern = /^(\$)?(\d+(\.\d{1,2})?)$/
const avgDaysInMonth = 30.475
let costOfCoffee = 2.50
let costTotal = 0
let addFormOpen = false

const PriceList = [
    '$5',
    '$10',
    '$12',
    '$15',
    '$20'
]

/***************** FUNCTION DEFINITIONS **************/

function addSubscription(name, price) {
    // make sure no sub text is hidden 
    $('.no-subs-text').hide()
    // inc. sub count
    numSubs++
    $('#addSubFormContainer').after(`
        <div class="sub-item-container" id="subscription-${numSubs}">
        <div class="sub-item">
            <p>${name}</p>
            <p>${formatPrice(price)}</p>
        </div>
    </div>`)
    costTotal += price

    // update display
    let dailyCost = costTotal / avgDaysInMonth
    $('#cost-display').text(`${formatPrice(dailyCost)}`)
    $('#coffee-count').text(`${(dailyCost / costOfCoffee).toFixed(2)}`)
}

function processSubValue() {
    let priceString = $('#subPrice').val()
    if (priceString[0] == '$') {
        priceString = priceString.slice(1)
    }
    return Number(priceString)
}

function formatPrice(num) {
    return '$' + (Math.round(num * 100) / 100).toFixed(2)
}

function validatePrice() {
    let priceString = $('#subPrice').val()
    if (!priceString.match(pricePattern)) {
        $('#subPrice').addClass('error')
        return false
    } else {
        $('#subPrice').removeClass('error')
        return true
    }
}

/*************** APP INITIALIZATION *************/

// Populate saved subscriptions from localStorage

if (localStorage.getItem('subscriptions') != null) {
    subscriptions = JSON.parse(localStorage.getItem('subscriptions'))

    for (let sub of subscriptions) {
        addSubscription(sub.name, sub.price)
    }
}

/******************* EVENT LISTENERS *****************/

$('#addSubButton').click(() => {
    if (!addFormOpen) {
        $('#addSubFormContainer').show()
    } else {
        $('#addSubFormContainer').hide()
    } 
    addFormOpen = !addFormOpen
})

$('#subName').autocomplete({
    source: SubList,
    delay: 0,
    minLength: 0,
})

$('#subPrice').autocomplete({
    source: PriceList,
    delay: 0,
    minLength: 0,
})

$('#subPrice').on('focus', () => {
    $('#subPrice').autocomplete('search', '')
})

$('#confirmSubButton').click(() => {
    if (!validatePrice()) {
        // disallow submit
        console.log('nope')
        return
    }

    let price = processSubValue()
    
    addSubscription($('#subName').val(), price)

    subscriptions.push({
        name: $('#subName').val(),
        price: price,
    })
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions))

    $('#subPrice').val('')
    $('#subName').val('')

    $('#addSubFormContainer').hide()
    addFormOpen = !addFormOpen
})
