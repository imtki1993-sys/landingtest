import unittest

import numpy as np

from audio_utils import SAMPLE_RATE, assemble, expected_seconds, fade, normalize, pause_after, trim_silence


class AudioUtilsTest(unittest.TestCase):
    def tone(self, seconds, amp=0.3):
        t = np.arange(int(seconds * SAMPLE_RATE)) / SAMPLE_RATE
        return (amp * np.sin(2 * np.pi * 220 * t)).astype(np.float32)

    def test_trim_silence_keeps_speech(self):
        sil = np.zeros(SAMPLE_RATE, dtype=np.float32)
        out = trim_silence(np.concatenate([sil, self.tone(1.0), sil]))
        self.assertLess(len(out) / SAMPLE_RATE, 1.2)
        self.assertGreater(len(out) / SAMPLE_RATE, 0.95)

    def test_pauses(self):
        self.assertAlmostEqual(len(pause_after("واش بغيتي؟")) / SAMPLE_RATE, 0.45)
        self.assertAlmostEqual(len(pause_after("كوموندي دابا.")) / SAMPLE_RATE, 0.3)

    def test_fade_starts_and_ends_at_zero(self):
        out = fade(np.ones(SAMPLE_RATE, dtype=np.float32))
        self.assertEqual(out[0], 0.0)
        self.assertAlmostEqual(float(out[-1]), 0.0, places=4)

    def test_normalize_peak_and_level(self):
        out = normalize(self.tone(1.0, amp=0.05))
        self.assertLessEqual(float(np.max(np.abs(out))), 10 ** (-1 / 20) + 1e-6)
        loud = normalize(self.tone(1.0, amp=0.9))
        self.assertLessEqual(float(np.max(np.abs(loud))), 10 ** (-1 / 20) + 1e-6)

    def test_assemble_length(self):
        segs = [("جملة لولى.", self.tone(1.0)), ("جملة تانية؟", self.tone(1.5))]
        out = assemble(segs)
        seconds = len(out) / SAMPLE_RATE
        self.assertGreater(seconds, 2.5 + 0.3)
        self.assertLess(seconds, 2.5 + 0.3 + 0.15 + 0.25 + 0.3)

    def test_expected_seconds(self):
        self.assertAlmostEqual(expected_seconds("a b c d e f g h i j k l"), 5.0)


if __name__ == "__main__":
    unittest.main()
