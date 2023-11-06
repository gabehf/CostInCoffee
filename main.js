/*
*   TODO:
*   - (maybe) include coffee price somewhere
*   - (maybe) coffee price selector
*/

/********* CONSTANTS AND GLOBAL VARS  *********/

// List of subscription services I can think of, for the
// form to auto-fill
const SubList = [
    'LinkedIn Premium',
    'Netflix',
    'Hulu',
    'Crunchyroll',
    'Youtube Premium',
    'Skillshare',
    'Max',
    'Spotify',
    'Tidal',
    'Paramount+',
    'Peacock',
    'Disney+',
    'Amazon Prime',
    'Audible',
    'Scribd',
    'Apple TV+',
    'Curiosity Stream',
    'Kindle Unlimited'
]

// list of prices to be auto-suggested in the form
const PriceList = [
    '$5',
    '$10',
    '$12',
    '$15',
    '$20',
    '$40',
]

// array of current subscriptions
let subscriptions = []
// pretty much just for IDing the HTML in the sub list. dunno why its global tbh
let numSubs = 0
// matches $40.00, 40.00, 40, but not €40, 4.000, 4., 50c, etc.
const pricePattern = /^(\$)?(\d+(\.\d{1,2})?)$/
// these two are for calculating the cost in coffee
const avgDaysInMonth = 30.475
let costOfCoffee = 2.50
// total cost of all the user's subscriptions 
let costTotal = 0
// for opening/closing form
let addFormOpen = false

/***************** FUNCTION DEFINITIONS **************/

// rebuilds the sub list after one gets removed
// if we dont do this, the IDs in the HTML that we use for removing
// items starts to drift from the actual JS array
function updateSubList() {
    numSubs = 0
    console.log('rebuilding sub list...')
    for (let sub of subscriptions) {
        // add subscription to page
        $('#addSubFormContainer').after(`
            <div class="sub-item-container" id="subscription-${numSubs}">
            <div class="sub-item">
                <p>${sub.name}</p>
                <p>${formatPrice(sub.price)}</p>
            </div>
        </div>`)
        numSubs++
    }
}

// handler for form
function addSubFormHandler() {
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
}

// updates the coffee and price displays
function updateDisplay() {
    // update display
    let dailyCost = costTotal / avgDaysInMonth
    $('#cost-display').text(`${formatPrice(dailyCost)}`)
    $('#coffee-count').text(`${(dailyCost / costOfCoffee).toFixed(2)}`)
}

// handles logic for adding a new subscription
// note: not just UI logic, also updating total costs etc.
function addSubscription(name, price) {

    // make sure no sub text is hidden 
    $('.no-subs-text').hide()

    // add subscription to page
    $('#addSubFormContainer').after(`
        <div class="sub-item-container" id="subscription-${numSubs}">
        <div class="sub-item">
            <p>${name}</p>
            <p>${formatPrice(price)}</p>
        </div>
    </div>`)

    // inc. sub count
    numSubs++

    costTotal += price
    updateDisplay()
}

// handles logic for removing a subscription
// note: not just UI logic, also updating total costs etc.
function removeSubscription(index) {
    // get price from sub array
    let price = subscriptions[index].price
    // remove sub from array
    subscriptions.splice(index, 1)
    // if no subs are left, show no-sub text
    if (subscriptions.length == 0) {
        $('.no-subs-text').show()
    }
    // remove sub from localstorage
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions))
    // remove sub from ui
    $(`#subscription-${index}`).remove()
    // subtract price from totalcost
    costTotal -= price
    // update display
    updateDisplay()
}

// takes sub cost from form and returns it as an actual number
function processSubValue() {
    let priceString = $('#subPrice').val()
    if (priceString[0] == '$') {
        priceString = priceString.slice(1)
    }
    return Number(priceString)
}

// takes number and returns it as $X.XX string
function formatPrice(num) {
    return '$' + (Math.round(num * 100) / 100).toFixed(2)
}

// checks cost in form against regex, updates UI for error
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
        $('#addSubButton').css('background-color', 'var(--brown)')
        $('#addSubButton').css('color', 'var(--main-bg)')
        $('#addSubFormContainer').show()
    } else {
        $('#addSubButton').css('background-color', '')
        $('#addSubButton').css('color', '')
        $('#addSubFormContainer').hide()
    } 
    addFormOpen = !addFormOpen
})

$('#subName').autocomplete({
    source: SubList,
    delay: 0,
    autoFocus: true,
})

$('#subPrice').autocomplete({
    source: PriceList,
    delay: 0,
    minLength: 0,
    autoFocus: true,
})

$('#subPrice').on('focus', () => {
    $('#subPrice').autocomplete('search', '')
})

$('#confirmSubButton').click(() => {
    addSubFormHandler()
})

$('#add-sub-form').keypress((e) => {
    if (e.which == 13) {
        addSubFormHandler()
        return false
    }
})

// these two are UI logic for the remove subscription button
$('#subscriptions').on('mouseenter', '.sub-item-container', function() {
    $(this).append(`<button id="${$(this).attr('id') + '-del'}" class="del-sub-button">X</button>`);
    $(`#${$(this).attr('id') + '-del'}`).animate({
        left: "-=40",
      }, 200, function() {
    })
})
$('#subscriptions').on('mouseleave', '.sub-item-container', function() {
    $(`#${$(this).attr('id') + '-del'}`).animate({
        left: "+=40",
      }, 200, function() {
        $(`#${$(this).attr('id') + '-del'}`).remove()
    })
})

$('#subscriptions').on('click', '.del-sub-button', function() {
    // get index of sub to delete
    let subIndex = $(this).attr('id').split('-')[1]
    removeSubscription(subIndex)
    $('.sub-item-container').remove()
    updateSubList()
})
