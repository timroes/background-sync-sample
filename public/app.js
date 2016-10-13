function guid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function addMessage(text, mine) {
	const chat = $('#chat');
	const msg = $(`<div class="chat-msg ${mine ? 'chat-msg-mine' : 'chat-msg-others'}">${text}</div>`);
	chat.append(msg);
	chat.scrollTop(chat.prop('scrollHeight'));
}

const myId = guid();
const db = new PouchDB('outbox');

navigator.serviceWorker.register('/sw.js');

$('#message-input').submit(ev => {
	ev.preventDefault();
	const text = $('#message-text').val();

	if (!text) {
		return;
	}

	// Put the message into IndexDB
	db.put({
		_id: `${Date.now()}`,
		uid: myId,
		msg: text
	}).then(() => {
		// When finished get the serviceWorker when it's ready
		return navigator.serviceWorker.ready;
	}).then(sw => {
		// Trigger a new sync event.
		sw.sync.register('outbox');
	});

	// Add the message to the list
	addMessage(text, true);

	$('#message-text').val('');
});

const socket = io();
socket.on('msg', data => {
	// Show received messages as long as they are not my own
	if (data.uid !== myId) {
		addMessage(data.msg, false);
	}
});
