// 해솔반 원아 20명 프로필 데이터 및 한국어 조사 헬퍼

export const haesolChildren = [
  { id: 'child-1', name: '강시아', photo: '/children/강시아.jpg', tag: '#사랑스러운 #해솔반' },
  { id: 'child-2', name: '김나연', photo: '/children/김나연.jpg', tag: '#밝은미소 #해솔반' },
  { id: 'child-3', name: '김단우', photo: '/children/김단우.jpg', tag: '#씩씩한 #해솔반' },
  { id: 'child-4', name: '김소이', photo: '/children/김소이.jpg', tag: '#다정한 #해솔반' },
  { id: 'child-5', name: '김예준', photo: '/children/김예준.jpg', tag: '#호기심많은 #해솔반' },
  { id: 'child-6', name: '김우진', photo: '/children/김우진.jpg', tag: '#용감한 #해솔반' },
  { id: 'child-7', name: '민이준', photo: '/children/민이준.jpg', tag: '#재치있는 #해솔반' },
  { id: 'child-8', name: '박소은', photo: '/children/박소은.jpg', tag: '#착하고다정한 #해솔반' },
  { id: 'child-9', name: '안지솔', photo: '/children/안지솔.jpg', tag: '#반짝이는 #해솔반' },
  { id: 'child-10', name: '오아윤', photo: '/children/오아윤.jpg', tag: '#마음이따뜻한 #해솔반' },
  { id: 'child-11', name: '유해준', photo: '/children/유해준.jpg', tag: '#씩씩한대장 #해솔반' },
  { id: 'child-12', name: '이담비', photo: '/children/이담비.jpg', tag: '#귀여운미소 #해솔반' },
  { id: 'child-13', name: '이로훈', photo: '/children/이로훈.jpg', tag: '#달리기대장 #해솔반' },
  { id: 'child-14', name: '이유주', photo: '/children/이유주.jpg', tag: '#상냥하고예쁜 #해솔반' },
  { id: 'child-15', name: '임라윤', photo: '/children/임라윤.jpg', tag: '#노래잘하는 #해솔반' },
  { id: 'child-16', name: '임이준', photo: '/children/임이준.jpg', tag: '#멋쟁이친구 #해솔반' },
  { id: 'child-17', name: '장이서', photo: '/children/장이서.jpg', tag: '#애교만점 #해솔반' },
  { id: 'child-18', name: '정시하', photo: '/children/정시하.jpg', tag: '#생각이깊은 #해솔반' },
  { id: 'child-19', name: '정하린', photo: '/children/정하린.jpg', tag: '#햇살같은 #해솔반' },
  { id: 'child-20', name: '채제이', photo: '/children/채제이.jpg', tag: '#에너지넘치는 #해솔반' }
];

/**
 * 한글 이름 받침 유무에 따른 자연스러운 조사 변환 헬퍼
 * 예: 예준 + '이/가' -> 예준이가
 *     시아 + '이/가' -> 시아가
 */
export function formatKoreanParticle(name, type) {
  if (!name) return '';
  const lastChar = name.charAt(name.length - 1);
  const code = lastChar.charCodeAt(0);

  // 한글 음절 판별 (가: 0xAC00 ~ 힣: 0xD7A3)
  const isHangul = code >= 0xAC00 && code <= 0xD7A3;
  if (!isHangul) return name;

  const hasJongseong = (code - 0xAC00) % 28 !== 0;

  switch (type) {
    case 'iga':
    case 'subj': // 주격 (예준이가, 시아가)
      return hasJongseong ? `${name}이가` : `${name}가`;
    case 'i': // 호칭 접미사 이 (예준이, 시아)
      return hasJongseong ? `${name}이` : name;
    case 'ui':
    case 'poss': // 소유격 (예준이의, 시아의)
      return hasJongseong ? `${name}이의` : `${name}의`;
    case 'eunneun':
    case 'topic': // 은/는 (예준이는, 시아는)
      return hasJongseong ? `${name}이는` : `${name}는`;
    case 'eulleul':
    case 'obj': // 을/를 (예준이를, 시아를)
      return hasJongseong ? `${name}이를` : `${name}를`;
    case 'gwa': // 와/과 (예준이와, 시아와)
      return hasJongseong ? `${name}이와` : `${name}와`;
    case 'euro': // 으로/로
      return hasJongseong ? `${name}으로` : `${name}로`;
    default:
      return name;
  }
}
