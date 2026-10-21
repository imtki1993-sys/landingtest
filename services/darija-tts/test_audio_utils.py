import unittest

import numpy as np

import shutil

from audio_utils import (
    SAMPLE_RATE,
    assemble,
    audio_filters,
    expressiveness,
    expected_seconds,
    fade,
    fit_tempo,
    normalize,
    pause_after,
    pitch_track,
    sentence_speed,
    style_of,
    to_mp3,
    trim_silence,
)


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


    def test_pause_scale(self):
        self.assertAlmostEqual(len(pause_after("جملة.", scale=1.5)) / SAMPLE_RATE, 0.45, places=2)
        self.assertAlmostEqual(len(pause_after("جملة.", scale=0.6)) / SAMPLE_RATE, 0.18, places=2)

    def test_fit_tempo(self):
        self.assertEqual(fit_tempo(29, 30), 1.0)
        self.assertEqual(fit_tempo(30.5, 30), 1.0)
        self.assertAlmostEqual(fit_tempo(33, 30), 1.1)
        self.assertEqual(fit_tempo(50, 30), 1.25)
        self.assertEqual(fit_tempo(50, None), 1.0)
        self.assertIn("atempo=1.100", audio_filters(1.1))
        self.assertNotIn("atempo", audio_filters(1.0))

    @unittest.skipUnless(shutil.which("ffmpeg"), "ffmpeg absent")
    def test_mp3_with_tempo(self):
        t = np.linspace(0, 2, 2 * SAMPLE_RATE, dtype=np.float32)
        wave = 0.3 * np.sin(2 * np.pi * 220 * t).astype(np.float32)
        self.assertGreater(len(to_mp3(wave, tempo=1.2)), 1000)

    def test_style_of(self):
        self.assertEqual(style_of("واش عييتي؟"), "question")
        self.assertEqual(style_of("واو!"), "exclaim")
        self.assertEqual(style_of("وكاين واحد الحاجة،"), "continue")
        self.assertEqual(style_of("طلب دابا."), "neutral")
        self.assertEqual(sentence_speed("واو!", 1.0), 1.04)
        self.assertEqual(sentence_speed("واش؟", 1.0), 0.97)

    def test_assemble_with_gaps(self):
        segs = [("واش؟", self.tone(1.0)), ("واو!", self.tone(1.0))]
        short = assemble(segs, gaps=[0.1, 0])
        long_ = assemble(segs, gaps=[0.6, 0])
        self.assertAlmostEqual((len(long_) - len(short)) / SAMPLE_RATE, 0.5, places=2)

    def test_pitch_and_rise(self):
        t = np.arange(int(1.5 * SAMPLE_RATE)) / SAMPLE_RATE
        flat = 0.3 * np.sin(2 * np.pi * 200 * t)
        f0 = pitch_track(flat)
        self.assertAlmostEqual(float(np.median(f0[f0 > 0])), 200, delta=6)
        # mélodie qui monte à la fin (question)
        freq = np.where(t < 1.1, 180.0, 180.0 + (t - 1.1) * 300)
        rising = 0.3 * np.sin(2 * np.pi * np.cumsum(freq) / SAMPLE_RATE)
        self.assertGreater(expressiveness(rising)["rise"], 2)
        self.assertLess(abs(expressiveness(flat)["rise"]), 0.5)


if __name__ == "__main__":
    unittest.main()
