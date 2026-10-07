"""
Mental Health Screening Questionnaire Definition.

This is a PROTOTYPE self-report questionnaire created for the HealthOS
demonstration project. It is NOT an established or validated clinical
instrument. It is NOT a substitute for professional evaluation.

The questions are based on commonly-reported symptom domains described
in publicly available mental health literature (e.g., mood, sleep, energy,
concentration, self-worth, social withdrawal, appetite) and are structured
to mirror the format of well-known screening tools without reproducing
any proprietary wording or scoring systems.

Scoring interpretation thresholds used here are illustrative only and
have NOT been validated for any specific population or clinical use.
"""

QUESTIONNAIRE_VERSION = "prototype-v1"

QUESTIONNAIRE_TITLE = "HealthOS Mental Health Self-Report Questionnaire"

QUESTIONNAIRE_INSTRUCTIONS = (
    "Over the last 2 weeks, how often have you been bothered by each of the following? "
    "Please answer honestly. There are no right or wrong answers. "
    "Your responses are not stored with any identifying information. "
    "This questionnaire screens for symptoms — it does not diagnose any condition."
)

# Response options: value -> label
RESPONSE_OPTIONS = {
    0: "Not at all",
    1: "Several days",
    2: "More than half the days",
    3: "Nearly every day",
}

VALID_RESPONSE_VALUES = set(RESPONSE_OPTIONS.keys())

QUESTIONS = [
    {
        "id": "q1",
        "text": "Little interest or pleasure in doing things",
        "symptom_label": "Low interest / anhedonia",
        "required": True,
        "safety_flag": False,
    },
    {
        "id": "q2",
        "text": "Feeling down, depressed, or hopeless",
        "symptom_label": "Depressed mood / hopelessness",
        "required": True,
        "safety_flag": False,
    },
    {
        "id": "q3",
        "text": "Trouble falling or staying asleep, or sleeping too much",
        "symptom_label": "Sleep disturbance",
        "required": True,
        "safety_flag": False,
    },
    {
        "id": "q4",
        "text": "Feeling tired or having little energy",
        "symptom_label": "Fatigue / low energy",
        "required": True,
        "safety_flag": False,
    },
    {
        "id": "q5",
        "text": "Poor appetite or overeating",
        "symptom_label": "Appetite disturbance",
        "required": True,
        "safety_flag": False,
    },
    {
        "id": "q6",
        "text": (
            "Feeling bad about yourself, or that you are a failure, "
            "or have let yourself or your family down"
        ),
        "symptom_label": "Low self-worth / guilt",
        "required": True,
        "safety_flag": False,
    },
    {
        "id": "q7",
        "text": (
            "Trouble concentrating on things, such as reading or watching television"
        ),
        "symptom_label": "Concentration difficulties",
        "required": True,
        "safety_flag": False,
    },
    {
        "id": "q8",
        "text": (
            "Moving or speaking so slowly that other people could have noticed, "
            "or being so fidgety or restless that you have been moving around "
            "a lot more than usual"
        ),
        "symptom_label": "Psychomotor changes",
        "required": True,
        "safety_flag": False,
    },
    {
        "id": "q9",
        "text": (
            "Thoughts that you would be better off dead, or thoughts of hurting yourself"
        ),
        "symptom_label": "Thoughts of self-harm",
        "required": True,
        "safety_flag": True,  # Triggers safety response if > 0
    },
]

# Score interpretation bands (illustrative only — not clinically validated)
SCORE_INTERPRETATION = [
    {
        "min": 0,
        "max": 4,
        "label": "Minimal symptoms",
        "description": (
            "Your responses indicate few or no symptoms in the areas assessed. "
            "Everyone has difficult days. If you feel your wellbeing is affected, "
            "speaking with a healthcare professional is always worthwhile."
        ),
    },
    {
        "min": 5,
        "max": 9,
        "label": "Mild symptom range",
        "description": (
            "Your responses indicate some symptoms in areas associated with low mood. "
            "Consider monitoring your wellbeing and speaking with a GP or counsellor "
            "if symptoms persist or worsen."
        ),
    },
    {
        "min": 10,
        "max": 14,
        "label": "Moderate symptom range",
        "description": (
            "Your responses indicate a moderate number of symptoms. "
            "It is advisable to discuss these results with a qualified healthcare "
            "professional who can provide appropriate support."
        ),
    },
    {
        "min": 15,
        "max": 19,
        "label": "Moderately severe symptom range",
        "description": (
            "Your responses indicate several symptoms that may be significantly "
            "affecting your daily life. Please consider speaking with a healthcare "
            "professional soon."
        ),
    },
    {
        "min": 20,
        "max": 27,
        "label": "Severe symptom range",
        "description": (
            "Your responses indicate many symptoms in areas commonly associated with "
            "significant distress. We strongly encourage you to seek support from "
            "a qualified healthcare professional as soon as possible."
        ),
    },
]

SAFETY_MESSAGE = (
    "Your response to the self-harm question indicates you may be having thoughts "
    "of hurting yourself. Please reach out for support — you do not have to face "
    "this alone.\n\n"
    "If you are in immediate danger, please call emergency services (112 / 911 / your local emergency number).\n\n"
    "Crisis support lines (verify these numbers for your country):\n"
    "- iCall (India): 9152987821\n"
    "- Vandrevala Foundation (India): 1860-2662-345 (24/7)\n"
    "- Samaritans (UK): 116 123\n"
    "- Crisis Text Line (US): Text HOME to 741741\n"
    "- Lifeline (Australia): 13 11 14\n\n"
    "This software cannot determine whether you are safe. Please contact a "
    "healthcare professional or trusted person right away."
)

DISCLAIMER = (
    "IMPORTANT: This questionnaire is a PROTOTYPE self-report screening tool. "
    "It has not been clinically validated. Results are not a medical diagnosis "
    "and do not replace evaluation by a qualified healthcare professional. "
    "Scores are calculated for illustrative purposes only. "
    "Do not make medical decisions based solely on these results."
)
