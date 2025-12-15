/**
 * Simple wrapper for the Web Speech API to provide immediate feedback
 * for visually impaired users before the Gemini AI connects.
 */
export const speak = (text: string, onEnd?: () => void) => {
  if ('speechSynthesis' in window) {
    // Cancel previous utterances to avoid queue buildup
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX'; // Latin American Spanish
    utterance.rate = 1.1; // Slightly faster reading
    utterance.pitch = 1.0;
    
    if (onEnd) {
      utterance.onend = () => {
        onEnd();
      };
      // Handle cases where speech might fail or be cancelled immediately
      utterance.onerror = () => {
        console.warn("Speech synthesis error or cancel");
        // We generally don't trigger onEnd here to avoid unexpected state jumps
      };
    }
    
    window.speechSynthesis.speak(utterance);
  } else {
    // Fallback if no speech synthesis
    if (onEnd) onEnd();
  }
};