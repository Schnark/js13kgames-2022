/*global levelData: true*/
levelData =
(function () {
"use strict";

var placeholder = {
		map:
			'0         ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'    2     ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'         1'
	};

return [
	{title: 'Tutorial', desc: 'Play these tutorial levels first.', lock: 0, levels: [{
		map:
			'   #      ' +
			' 0!       ' +
			'   #      ' +
			'####      ' +
			'          ' +
			'  #####   ' +
			'  #   #   ' +
			'  # 2 #   ' +
			'  #   #   ' +
			'  ## ##   ' +
			'          ' +
			'      ####' +
			'      #   ' +
			'       !1 ' +
			'      #   ',
		'!': [
			'Welcome! Try to meet Blue, but avoid Death.',
			'Welcome! Try to meet Yellow, but avoid Death.'
		]
	}, {
		map:
			'0  !      ' +
			'    ~     ' +
			'       ~  ' +
			'          ' +
			'   ~      ' +
			'~        ~' +
			'          ' +
			'    3     ' +
			'          ' +
			' ~      ~ ' +
			'          ' +
			'    ~     ' +
			' ~        ' +
			'   ~      ' +
			'      !  1',
		'!': [
			'This time Death will move the other way. And don’t fall into the fire pits!',
			'This time Death will move the other way. And don’t fall into the fire pits!'
		]
	}, {
		map:
			'0 !       ' +
			'      .   ' +
			'          ' +
			'#####-####' +
			'          ' +
			'          ' +
			'          ' +
			'    2     ' +
			'          ' +
			'  .       ' +
			'          ' +
			'####-#####' +
			'          ' +
			'          ' +
			'       ! 1',
		'!': [
			'The triggers will open and close the doors.',
			'The triggers will open and close the doors.'
		],
		'.': [
			[4, 11, 0],
			[5, 3, 0]
		]
	}, {
		map:
			'0 !       ' +
			'    ?     ' +
			'          ' +
			'##########' +
			'          ' +
			'          ' +
			'          ' +
			'    2     ' +
			'          ' +
			'          ' +
			'          ' +
			'##########' +
			'          ' +
			'    ?     ' +
			'       ! 1',
		'!': [
			'The teleporters will take you somewhere else. Let’s hope the place is free and safe!',
			'The teleporters will take you somewhere else. Let’s hope the place is free and safe!'
		],
		'?': [
			[4, 4, 0],
			[5, 10, 0]
		]
	}, {
		map:
			'0!$       ' +
			'  $       ' +
			'$$$       ' +
			'          ' +
			'          ' +
			'  $$$$$   ' +
			'  $   $   ' +
			'  $ 2 $   ' +
			'  $   $   ' +
			'  $$$$$   ' +
			'          ' +
			'          ' +
			'       $$$' +
			'       $ !' +
			'       $ 1',
		'!': [
			'You can push boxes to a free place, but only one at a time.',
			'You can push boxes to a free place, but only one at a time.'
		]
	}, {
		map:
			'0 !       ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'         ?' +

			'?         ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'       ! 1' +

			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'    2     ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ',
		'!': [
			'Where is Blue? Perhaps you should use the teleporter.',
			'Where is Yellow? Perhaps you should use the teleporter.'
		],
		'?': [
			[0, 0, 2],
			[9, 14, 2]
		]
	}]},
	{title: 'Group 1', desc: 'Solve all the tutorial levels to unlock.', lock: 6, levels: [
		placeholder,
		placeholder,
		placeholder,
		placeholder
	]},
	{title: 'Group 2', desc: 'Solve eight levels to unlock.', lock: 8, levels: [
		placeholder,
		placeholder,
		placeholder,
		placeholder
	]},
	{title: 'Bonus', desc: 'Bonus levels', lock: 'bonus', levels: [
		placeholder,
		placeholder,
		placeholder,
		placeholder
	]}
];

})();