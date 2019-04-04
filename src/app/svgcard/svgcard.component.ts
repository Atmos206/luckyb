import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'svg-card',
  templateUrl: './svgcard.component.html',
  styleUrls: ['./svgcard.component.scss']
})
export class SvgcardComponent implements OnInit {
  @Input() carddata: any;
  @Input() hidevalue: boolean;
  vm: any = {};
  SUIT = {
    Clubs: {
      name: 'Clubs',
      symbol: '♣',
      color: 'black'
    },
    Diamonds: {
      name: 'Diamonds',
      symbol: '♦',
      color: 'red'
    },
    Spades: {
      name: 'Spades',
      symbol: '♠',
      color: 'black'
    },
    Hearts: {
      name: 'Hearts',
      symbol: '♥',
      color: 'red'
    }
  };

  RANK = {
    14: {
      name: 'ace',
      symbol: 'A',
      value: 14
    },
    2: {
      name: 'two',
      symbol: '2',
      value: 2
    },
    3: {
      name: 'three',
      symbol: '3',
      value: 3
    },
    4: {
      name: 'four',
      symbol: '4',
      value: 4
    },
    5: {
      name: 'five',
      symbol: '5',
      value: 5
    },
    6: {
      name: 'six',
      symbol: '6',
      value: 6
    },
    7: {
      name: 'seven',
      symbol: '7',
      value: 7
    },
    8: {
      name: 'eight',
      symbol: '8',
      value: 8
    },
    9: {
      name: 'nine',
      symbol: '9',
      value: 9
    },
    10: {
      name: 'ten',
      symbol: '10',
      value: 10
    },
    11: {
      name: 'jack',
      symbol: 'J',
      value: 11
    },
    12: {
      name: 'queen',
      symbol: 'Q',
      value: 12
    },
    13: {
      name: 'king',
      symbol: 'K',
      value: 13
    }
  };

  constructor() {}

  ngOnInit() {
    this.vm.card = {
      suit: this.SUIT[this.carddata.suit],
      rank: this.RANK[this.carddata.value],
      hideValue: !!this.hidevalue
    };
    this.vm.hoverCard = false;
    this.vm.toggleHover = function() {
      this.vm.hoverCard = !this.vm.hoverCard;
    };

    this.vm.toggleBackside = function() {
      this.vm.card.hideValue = !this.vm.card.hideValue;
    };
  }
}
