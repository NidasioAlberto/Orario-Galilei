if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        /*.then(reg => console.log('Service workewr registrato', reg))
        .catch(err => console.log('Service worker non registrato', err))*/
}