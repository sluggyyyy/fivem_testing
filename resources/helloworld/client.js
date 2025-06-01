setInterval(() => {
    console.log('Hello FiveM World!');
    TriggerEvent('chatMessage', '^2[MyFirstScript]', [255, 255, 255], 'Hello FiveM World!');
}, 30000);

