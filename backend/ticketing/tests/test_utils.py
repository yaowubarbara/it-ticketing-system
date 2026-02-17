import pytest
from ticketing.utils import cosine_similarity, analyze_category, generate_general_solution


class TestCosineSimilarity:
    def test_identical_vectors_return_one(self):
        vec = [1.0, 0.0, 0.0]
        assert cosine_similarity(vec, vec) == pytest.approx(1.0)

    def test_orthogonal_vectors_return_zero(self):
        vec1 = [1.0, 0.0]
        vec2 = [0.0, 1.0]
        assert cosine_similarity(vec1, vec2) == pytest.approx(0.0)

    def test_zero_vectors_return_zero(self):
        vec = [0.0, 0.0, 0.0]
        assert cosine_similarity(vec, vec) == 0.0

    def test_none_input_returns_zero(self):
        assert cosine_similarity(None, [1.0, 2.0]) == 0.0
        assert cosine_similarity([1.0, 2.0], None) == 0.0


class TestAnalyzeCategory:
    def test_network_keywords(self):
        assert analyze_category('wifi not working', 'cannot connect to network') == 'network'

    def test_hardware_keywords(self):
        assert analyze_category('printer issue', 'the printer is jammed') == 'hardware'

    def test_software_keywords(self):
        assert analyze_category('Outlook crash', 'software keeps closing') == 'software'

    def test_unknown_returns_other(self):
        assert analyze_category('general question', 'how to use the system') == 'other'


class TestGenerateGeneralSolution:
    def test_returns_string_for_each_category(self):
        for category in ['hardware', 'software', 'network', 'permission', 'other']:
            result = generate_general_solution(category, 'test', 'test')
            assert isinstance(result, str)
            assert len(result) > 0
