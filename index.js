const $ = document.querySelector.bind( document );

const game = {
    starting: false,
    running: false,
    start_time: 0,
    react_time: 0,
    reaction: 0,

    start_enable: true,

    dirty_boards: true,
    leaderboard: [],
    history: [],
};

const RED_COLOR = 'red';// 'hsla(0, 85%, 55%, 1)';
const GREEN_COLOR = 'limegreen';//'hsl(116, 85%, 55%)';

const LEADERBOARD_TEMPLATE = $( "#leaderboard-template" ).innerHTML;
const HISTORY_TEMPLATE = $( "#history-template" ).innerHTML;


let target_el = $( '#target' );
let timer_el = $( '#timer' );

let overlay_el = $( '#overlay' );
let start_el = $( '#start' );
let leaderboard_el = $( '#leaderboard-list' );
let history_el = $( '#history-list' );

start_el.onmouseup = ( {button} ) => {
    if( button !== 0 ) {
        return;
    }

    if( game.start_enable && !game.running ) {
        start_game();
    }

    if( !game.start_enable && !game.running ){
        game.start_enable = true;
    }
};

target_el.onmousedown = () => {
    if( game.running ) {
        end_game();
    }
};

target_el.onmouseup = () => {
    if( !game.start_enable && !game.running ){
        game.start_enable = true;
    }
}

function start_game() {
    game.running = true;
    game.start_time = Date.now();
    game.react_time = Date.now() + (
        1000 +
        Math.floor( Math.random() * 2000 )
    );

    game.start_enable = false;
}

function end_game() {
    game.running = false;
    if( game.reaction < 0 ) {
        console.log( 'u suck' )
    }

    if( game.reaction >= 0 ) {
        let score = {
            reaction: game.reaction,
            date: Date.now(),
            medal: game.reaction < 250,
        };

        game.history.splice( 0, 0, score );
        game.history = game.history.slice(0, 5);

        game.leaderboard.push( score );
        game.leaderboard = game.leaderboard
            .sort( ( a, b ) => a.reaction - b.reaction )
            .slice(0, 5);

        game.dirty_boards = true;
    }

    target_el.style.zIndex = -1;
    overlay_el.style.opacity = 1;
}

function create_element( template, vars ) {
    for( let name in vars ) {
        template = template.replace( `{{${name}}}`, vars[name] );
    }

    template =  template
        .replace( /{{(?:\s+)?if(?:\s+)?true(?:\s+)?{(.+)}(?:\s+)?}}/, '$1' )
        .replace( /{{(?:\s+)?if(?:\s+)?.+(?:\s+)?{(.+)}(?:\s+)?}}/, '' );

    let div = document.createElement( 'div' );
    div.innerHTML = template;
    return div.children[0];
}

function draw() {
    if( game.running ) {
        let position = Date.now() - game.react_time;
        game.reaction = position;

        if( position < 0 ) {
            timer_el.innerText = '';
            target_el.style.zIndex = 1;
            target_el.style.background = RED_COLOR;
            overlay_el.style.opacity = 0;
        }

        if( position >= 0 ) {
            if( target_el.style.background !== GREEN_COLOR ) {
                target_el.style.background = GREEN_COLOR;
            }

            timer_el.innerText = `${position}ms`;
        }
    }

    if( game.dirty_boards ) {
        leaderboard_el.innerHTML = "";
        history_el.innerHTML = "";

        for( let i = 0; i < 5; i++ ) {
            let leaderboard_score = game.leaderboard[i];
            let history_score = game.history[i];

            if( typeof leaderboard_score !== 'undefined' ) {
                leaderboard_el.appendChild( create_element( LEADERBOARD_TEMPLATE, leaderboard_score ) );
            } else {
                leaderboard_el.appendChild( document.createElement( 'li' ) );
            }

            if( typeof history_score !== 'undefined' ) {
                history_el.appendChild( create_element( HISTORY_TEMPLATE, history_score ) );
            } else {
                history_el.appendChild( document.createElement( 'li' ) );
            }
        }

        game.dirty_boards = false;
    }

    requestAnimationFrame( draw );
}

draw();