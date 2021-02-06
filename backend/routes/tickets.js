const router = require('express').Router();
const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');

router.route('/favicon.ico').get((req, res) => { 
    res.status(204).end();
});

router.route('/').get((req, res) => {
    Ticket.find()
        .populate('submitter')
        .populate('assignee')
        .then(tickets => res.json(tickets))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/').post((req, res) => {
    const title = req.body.title;
    const submitter = req.body.submitter;
    const assignee = req.body.assignee;
    const priority = req.body.priority;
    const status = req.body.status;
    const created = req.body.created;
    const chat = req.body.chat;

    const newTicket = new Ticket({
        title,
        submitter,
        assignee,
        priority,
        status,
        created,
        chat,
    });

    newTicket.save() 
        .then(() => {
            User.find()
                .cursor()
                .eachAsync(async function (user) {
                    let notification = {
                        section : 'Tickets',
                        message : 'A new ticket has been created : ' + req.body.title,
                        date : new Date(),
                    }
                    user.notifications.push(notification);
                    await user.save();
                })
                .then(() => res.json('Ticket created!'))
                .catch(err => res.status(500).json('Error: ' + err));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
    Ticket.findById(req.params.id)
        .populate('submitter')
        .populate('assignee')
        .populate({
            path: 'chat',
            populate: { path: 'author' }
        })
        .then(ticket => res.json(ticket))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/:id').post((req, res) => {
    Ticket.findById(req.params.id)
        .then(ticket => {
            let newAssignee = false;
            let message = '';
            let assignee = ticket.assignee;

            if ((assignee === null && req.body.assignee !== null) || (assignee !== null && assignee.toString() !== req.body.assignee)) {
                newAssignee = true;
            } else if (ticket.priority !== req.body.priority) {
                message = 'The ticket "' + req.body.title + '" has a new priority : "' + req.body.priority + '"';
            } else if (ticket.status !== req.body.status) {
                message = 'The ticket "' + req.body.title + '" has a new status : "' + req.body.status + '"';
            } else if (ticket.chat.length !== req.body.chat.length) {
                message = 'The ticket "' + req.body.title + '" has a new message';
            }

            ticket.title = req.body.title;
            ticket.submitter = req.body.submitter;
            ticket.assignee = req.body.assignee;
            ticket.priority = req.body.priority;
            ticket.status = req.body.status;
            ticket.chat= req.body.chat;
  
            ticket.save()
                .then(() => {
                    if (newAssignee) {
                        User.findById(req.body.assignee)
                            .then(user => {
                                let notification = {
                                    section : 'Tickets',
                                    message : 'You have been assigned to a new ticket : "' + req.body.title + '"',
                                    date : new Date(),
                                }
                                user.notifications.push(notification);

                                user.save()
                                    .then(() => res.json('Ticket updated!'))
                                    .catch(err => res.status(500).json('Error: ' + err));
                            })
                            .catch(err => res.status(500).json('Error: ' + err));

                    } else if (ticket.assignee !== null && req.session.user_id === ticket.submitter.toString()) {
                        User.findById(ticket.assignee)
                            .then((user) => {
                                let notification = {
                                    section : 'Tickets',
                                    message : message,
                                    date : new Date(),
                                }
                                user.notifications.push(notification);
                                user.save()
                                    .then(() => res.json('Ticket updated!'))
                                    .catch(err => res.status(500).json('Error: ' + err));
                            })

                    } else if (ticket.assignee !== null && req.session.user_id === ticket.assignee.toString()) {
                        User.findById(ticket.submitter)
                            .then((user) => {
                                let notification = {
                                    section : 'Tickets',
                                    message : message,
                                    date : new Date(),
                                }
                                user.notifications.push(notification);
                                user.save()
                                    .then(() => res.json('Ticket updated!'))
                                    .catch(err => res.status(500).json('Error: ' + err));
                            })

                    } else {
                        let users = req.body.assignee === null ? [ticket.submitter] : [ticket.submitter, ticket.assignee];
                        User.find({ _id: { $in: users }, })
                            .cursor()
                            .eachAsync(async function (user) {
                                let notification = {
                                    section : 'Tickets',
                                    message : message,
                                    date : new Date(),
                                }
                                user.notifications.push(notification);
                                await user.save();
                            })
                            .then(() => res.json('Ticket updated!'))
                            .catch(err => res.status(500).json('Error: ' + err));
                    }
                })
                .catch(err => res.status(500).json('Error: ' + err));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});
  
router.route('/:id').delete((req, res) => {
    Ticket.findByIdAndDelete(req.params.id)
        .then(() => res.json('Ticket deleted.'))
        .catch(err => res.status(500).json('Error: ' + err));    
});

module.exports = router;