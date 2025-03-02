import pytest

from Models.player import Player
from GUI.ui import DeckDetail


@pytest.fixture
def player():
    return Player('test')


@pytest.mark.parametrize(
    "attr, expected", [
        ('zzz', False),
        ('sortedDecksCode', True),
        ('riot', True),
        ('summary', True)
    ]
)
def test_player_attributes(player, attr, expected):
    assert hasattr(player, attr) is expected


@pytest.mark.parametrize(
    "code, outcome, time, expected",
    [
        ('aaa', 'win', 5, {'aaa': DeckDetail(1, 1, 5)}),
        ('bbb', 'not-win', 6, {'bbb': DeckDetail(1, 0, 6)}),
    ]
)
def test_add_match_to_summary(player, code, outcome, time, expected):
    player.addMatchToSummary(code, outcome, time)
    summary = player.summary.get(code)
    expected_summary = expected.get(code)

    assert summary.matches == expected_summary.matches
    assert summary.winNum == expected_summary.winNum
    assert summary.time == expected_summary.time


def test_add_4_matches_with_2_different_decks(player):
    deck1 = 'aa'
    deck2 = 'bb'

    player.addMatchToSummary(deck1, 'win', 0)
    player.addMatchToSummary(deck1, 'not-win', 1)
    player.addMatchToSummary(deck2, 'win', 2)
    player.addMatchToSummary(deck2, 'win', 3)

    assert player.summary.get(deck1).history == 'WLEE'
    assert player.summary.get(deck2).history == 'EEWW'


def test_checkOpponent():
    pass


@pytest.mark.parametrize(
    "deck_codes, expected", [
        (['aaa'], {'aaa': 1}),
        (['aaa', 'bbb'], {'aaa': 1, 'bbb': 1}),
        (['aaa', 'bbb', 'aaa'], {'aaa': 2, 'bbb': 1}),
        (['aaa', 'bbb', 'bbb'], {'aaa': 1, 'bbb': 2}),
        (['bbb', 'bbb', 'aaa'], {'aaa': 1, 'bbb': 2}),
    ]
)
def test_get_no_duplicate(player, deck_codes, expected):
    """given a list of deckcodes, return a sorted dictionary with the count of each deck.
    Assumes that there will be at least on deck code in the list"""
    result = player.getNoDuplicate(deck_codes)

    assert result == expected


def test_inspectPlayer():
    pass
