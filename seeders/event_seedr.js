const Event = require('../lib/models/event');

let minuteBegin = 10;

(new Event({
    team1_name: 'team11',
    team2_name: 'team21',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team12',
    team2_name: 'team22',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team13',
    team2_name: 'team23',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team14',
    team2_name: 'team24',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team15',
    team2_name: 'team25',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team16',
    team2_name: 'team26',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team17',
    team2_name: 'team27',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team18',
    team2_name: 'team28',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team19',
    team2_name: 'team29',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team110',
    team2_name: 'team210',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team111',
    team2_name: 'team211',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();

minuteBegin += 0.5;

(new Event({
    team1_name: 'team112',
    team2_name: 'team212',
    team1_odd: 1.5,
    team2_odd: 1.1,
    closingTime: Date.now() + (minuteBegin*60*1000)
})).save();
