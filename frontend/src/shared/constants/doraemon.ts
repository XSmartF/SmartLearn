export type DoraemonFeedbackKey =
	| 'correct'
	| 'correctStreak3'
	| 'correctStreak4'
	| 'correctStreak5'
	| 'incorrect'
	| 'incorrectHeavy';

export interface DoraemonFeedback {
	key: DoraemonFeedbackKey;
	src: string;
	alt: string;
	message?: string;
}

export const DORAEMON_FEEDBACK: Record<DoraemonFeedbackKey, DoraemonFeedback> = {
	correct: {
		key: 'correct',
		src: '/doraemon_congratulate.gif',
		alt: 'Doraemon chúc mừng bạn trả lời đúng',
		message: 'Tuyệt vời! Bạn đã trả lời chính xác.',
	},
	correctStreak3: {
		key: 'correctStreak3',
		src: '/doraemon_practicemore.gif',
		alt: 'Doraemon khích lệ bạn với chuỗi 3 câu đúng',
		message: 'Tiếp tục nào! Bạn đã đúng 3 câu liên tiếp.',
	},
	correctStreak4: {
		key: 'correctStreak4',
		src: '/doraemon_amazing.gif',
		alt: 'Doraemon trầm trồ với chuỗi 4 câu đúng',
		message: 'Không thể tin được! 4 câu liên tiếp rồi!',
	},
	correctStreak5: {
		key: 'correctStreak5',
		src: '/doraemon_youarethebest.gif',
		alt: 'Doraemon công nhận bạn là số 1 với 5 câu đúng liên tục',
		message: 'Bạn là số 1! Hơn 5 câu liên tiếp chính xác!',
	},
	incorrect: {
		key: 'incorrect',
		src: '/doraemon_warning.gif',
		alt: 'Doraemon cảnh báo vì câu trả lời sai',
		message: 'Không sao, cố gắng lại nhé!',
	},
	incorrectHeavy: {
		key: 'incorrectHeavy',
		src: '/doraemon_cry.gif',
		alt: 'Doraemon buồn vì bạn sai quá nhiều lần',
		message: 'Cố lên! Bạn có thể cải thiện mà.',
	},
};

export const getDoraemonFeedback = (key: DoraemonFeedbackKey): DoraemonFeedback => DORAEMON_FEEDBACK[key];
