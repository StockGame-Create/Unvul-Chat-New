import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MessageCircle, Globe, Users, Plus, Lock, Send, Heart, MessageSquare, LogOut, Sparkles, Zap, Smile, Palette, HelpCircle, X, Search, Bell, Settings, Menu, TrendingUp, Star, Award, Shield, Crown, Rocket, Image as ImageIcon, ChevronUp, ZoomIn, ChevronDown, Filter, Hash, AtSign, Clock, Trophy } from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('chat');
  const [lastToastTime, setLastToastTime] = useState(0);
  const [showRandomPicker, setShowRandomPicker] = useState(false);
const [randomMode, setRandomMode] = useState('race'); // race, beauty, lucky, dice
const [randomOptions, setRandomOptions] = useState(['', '', '', '']);
const [randomDelay, setRandomDelay] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // 11번째 줄 근처, state 선언 부분에 추가
  const [onlineUsers, setOnlineUsers] = useState([]);
const [onlineCount, setOnlineCount] = useState(0);
  const [bannedWords, setBannedWords] = useState([]);
const [newBannedWord, setNewBannedWord] = useState('');
  const [toast, setToast] = useState(null);
  const [showUserSettings, setShowUserSettings] = useState(false);
const [newDisplayName, setNewDisplayName] = useState('');
  const [showRoomList, setShowRoomList] = useState(true); // false → true로 변경
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedEmojis, setSelectedEmojis] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingRoom, setPendingRoom] = useState(null);
  const [roomPassword, setRoomPassword] = useState('');
  const [feedPosts, setFeedPosts] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [showDrawing, setShowDrawing] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [expandedImage, setExpandedImage] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const messagesEndRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#06b6d4');
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
const [lastToolUsage, setLastToolUsage] = useState({});
const TOOL_COOLDOWN = 5000; // 5초 쿨다운
const [showMentionList, setShowMentionList] = useState(false);
const [mentionSearch, setMentionSearch] = useState('');
const [mentions, setMentions] = useState([]);

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '😎', '🤔', '😍', '🚀', '⭐', '💪', '🎮', '🎨'];

  useEffect(() => {




    
    const checkFirebase = setInterval(() => {
      if (window.firebase) {
        clearInterval(checkFirebase);
        
        const firebaseConfig = {
          apiKey: "AIzaSyB2I_bmwVhb-0RO8ljvunDSa3K-TCSzt2E",
          authDomain: "unvul-chat.web.app"
          databaseURL: "https://unvul-chat-default-rtdb.firebaseio.com",
          projectId: "unvul-chat",
          storageBucket: "unvul-chat.firebasestorage.app",
          messagingSenderId: "347507903654",
          appId: "1:347507903654:web:229feb94c52849c2183867",
          measurementId: "G-GMRQMBM4X2"
        };
        
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(firebaseConfig);
        }
        
        window.firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            setUser({
              uid: user.uid,
              name: user.displayName,
              email: user.email,
              photo: user.photoURL
            });
            loadRooms();
            loadFeedPosts();
            loadCommunityPosts();
          } else {
            setUser(null);
          }
        });
      }
    }, 100);

    return () => clearInterval(checkFirebase);
  }, []);

useEffect(() => {
  if (selectedRoom && user) {
    const messagesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages`);
    messagesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
    });

    const membersRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/members`);
    const rulesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/rules`);
    const bannedWordsRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/bannedWords`);
    const leadersRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/leaders`);

    // 한 번에 모든 데이터 수집
    let roomData = {};
    
    // 👇 함수를 먼저 선언!
    const updateRoom = () => {
      if (roomData.members || roomData.rules || roomData.bannedWords || roomData.leaders) {
        setSelectedRoom(prev => ({
          ...prev,
          ...roomData
        }));
      }
    };

    membersRef.on('value', (snapshot) => {
      roomData.members = snapshot.val();
      updateRoom();
    });

    rulesRef.on('value', (snapshot) => {
      roomData.rules = snapshot.val() || {chat: {}, drawing: {}, emoji: {}, quiz: {}, random: {}};
      updateRoom();
    });

    bannedWordsRef.on('value', (snapshot) => {
      roomData.bannedWords = snapshot.val() || [];
      updateRoom();
    });

    leadersRef.on('value', (snapshot) => {
      roomData.leaders = snapshot.val() || {};
      updateRoom();
    });

    return () => {
      messagesRef.off();
      membersRef.off();
      rulesRef.off();
      bannedWordsRef.off();
      leadersRef.off();
    };
  }
}, [selectedRoom?.id, user]);


useEffect(() => {
  // 항상 맨 아래로 스크롤
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

// 방 입장 시 맨 아래로 스크롤
// 방 입장 시 맨 아래로 스크롤
useEffect(() => {
  if (selectedRoom?.id) {
    // DOM 렌더링 완료 후 강제로 맨 아래로 스크롤
    setTimeout(() => {
      const chatContainer = messagesEndRef.current?.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 300); // 딜레이를 300ms로 증가
  }
}, [selectedRoom?.id]);

  const loadRooms = () => {
    const roomsRef = window.firebase.database().ref('rooms');
    roomsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomsList = Object.keys(data).map(key => {
          const room = data[key];
          return {
            id: key,
            name: room.name,
            hasPassword: room.hasPassword,
            password: room.password,
            createdBy: room.createdBy,
            createdAt: room.createdAt,
            participants: room.participants
          };
        });
        setRooms(roomsList);
      }
    });
  };

useEffect(() => {
  if (selectedRoom && user) {
    const myOnlineRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/members/${user.uid}/online`);
    const myLastSeenRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/members/${user.uid}/lastSeen`);
   
    myOnlineRef.set(true);
    myLastSeenRef.set(Date.now());  // ← 추가
   
    myOnlineRef.onDisconnect().set(false);
    myLastSeenRef.onDisconnect().set(Date.now());  // ← 추가
   
    // 30초마다 lastSeen 업데이트
    const interval = setInterval(() => {
      myLastSeenRef.set(Date.now());
    }, 30000);
   
    return () => {
      clearInterval(interval);  // ← 추가
      myOnlineRef.set(false);
      myLastSeenRef.set(Date.now());  // ← 추가
    };
  }
}, [selectedRoom, user]);

// 멘션 알림 리스너
useEffect(() => {
  if (selectedRoom && user) {
    const mentionsRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/mentions/${user.uid}`);
    const seenMentions = new Set();
    
    const listener = mentionsRef.on('child_added', (snapshot) => {
      const mentionId = snapshot.key;
      
      // 이미 처리한 멘션은 무시
      if (seenMentions.has(mentionId)) return;
      seenMentions.add(mentionId);
      
      const mention = snapshot.val();
      
      setMentions(prev => {
        // 중복 체크
        if (prev.find(m => m.id === mentionId)) {
          return prev;
        }
        return [...prev, { id: mentionId, ...mention }];
      });
      

      
      // 10초 후 자동 삭제
      setTimeout(() => {
        snapshot.ref.remove();
        setMentions(prev => prev.filter(m => m.id !== mentionId));
      }, 10000);
    });
    
    return () => {
      mentionsRef.off('child_added', listener);
    };
  }
}, [selectedRoom, user]);

  const loadFeedPosts = () => {
    const postsRef = window.firebase.database().ref('feed');
    postsRef.limitToLast(20).on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setFeedPosts(postsList.reverse());
      }
    });
  };

  const loadCommunityPosts = () => {
    const postsRef = window.firebase.database().ref('community');
    postsRef.limitToLast(20).on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCommunityPosts(postsList.reverse());
      }
    });
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      await window.firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await window.firebase.auth().signOut();
      setSelectedRoom(null);
      setMessages([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateDisplayName = async () => {
  if (!newDisplayName.trim()) {
    alert('❌ Please enter a valid name!');
    return;
  }
  
  try {
    // Firebase Auth 이름 업데이트
    await window.firebase.auth().currentUser.updateProfile({
      displayName: newDisplayName.trim()
    });
    
    // 로컬 state 업데이트
    setUser({
      ...user,
      name: newDisplayName.trim()
    });
    
    // 모든 방의 members에서 이름 업데이트
    const roomsRef = window.firebase.database().ref('rooms');
    roomsRef.once('value', (snapshot) => {
      const roomsData = snapshot.val();
      if (roomsData) {
        Object.keys(roomsData).forEach(roomId => {
          const room = roomsData[roomId];
          if (room.members && room.members[user.uid]) {
            // 해당 방의 멤버 이름 업데이트
            window.firebase.database().ref(`rooms/${roomId}/members/${user.uid}/name`).set(newDisplayName.trim());
          }
          if (room.leaders && room.leaders[user.uid]) {
            // 리더인 경우 리더 이름도 업데이트
            window.firebase.database().ref(`rooms/${roomId}/leaders/${user.uid}/name`).set(newDisplayName.trim());
          }
        });
      }
    });
    
    showToast('✅ Name updated successfully!', 'success');
    setShowUserSettings(false);
    setNewDisplayName('');
  } catch (error) {
    console.error('Name update error:', error);
    alert('❌ Failed to update name. Please try again.');
  }
};

const createRoom = (roomData) => {
  const roomsRef = window.firebase.database().ref('rooms');
  const newRoom = roomsRef.push();
 newRoom.set({
  name: roomData.name,
  hasPassword: !!roomData.password,
  password: roomData.password || null,
  createdBy: user.uid,
  createdAt: Date.now(),
  participants: 0,
  creator: {
    uid: user.uid,
    name: user.name,
    photo: user.photo
  },
  leaders: {
    [user.uid]: {
      type: 'creator',
      name: user.name,
      photo: user.photo,
      assignedAt: Date.now()
    }
  },
  members: {},
rules: {
  chat: {},
  drawing: {},
  emoji: {},
  quiz: {},
  random: {}, // 추가
},
  bannedWords: [] // 추가
});
}

const joinRoom = (room) => {
  if (room.hasPassword) {
    setPendingRoom(room);
    setShowPasswordModal(true);
  } else {
    const roomRef = window.firebase.database().ref(`rooms/${room.id}`);
    roomRef.once('value', (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        setSelectedRoom({
          id: room.id,
          ...roomData,
          participants: 0,
          rules: roomData.rules || {chat: {}, drawing: {}, emoji: {}, quiz: {}, random: {}},
          bannedWords: roomData.bannedWords || [],
          leaders: roomData.leaders || {}  // ⭐ 추가
        });
      }
    });
    registerMember(room.id);
  }
};

// 온라인 인원 수 주기적 업데이트 (깜빡임 방지)
useEffect(() => {
  if (!selectedRoom) return;
  
  const updateOnlineCount = () => {
    if (selectedRoom.members) {
      let count = 0;
      Object.values(selectedRoom.members).forEach(member => {
        const isOnline = member.online === true && 
          member.lastSeen &&
          (Date.now() - member.lastSeen) < 300000;
        if (isOnline) count++;
      });
      
      // participants를 selectedRoom에 넣지 말고 별도 state로!
      setOnlineCount(count);
    }
  };
  
  const interval = setInterval(updateOnlineCount, 10000);
  updateOnlineCount();
  
  return () => clearInterval(interval);
}, [selectedRoom?.id]); // members

// 온라인 유저 목록 안정화
useEffect(() => {
  if (!selectedRoom || !selectedRoom.members) {
    setOnlineUsers([]);
    return;
  }
  
  const calculateOnlineUsers = () => {
    const online = Object.entries(selectedRoom.members).filter(([uid, member]) => {
      if (uid === user.uid) return false;
      return member.online === true;
    });
    setOnlineUsers(online);
  };
  
  calculateOnlineUsers();
  
  // 5초마다만 업데이트 (깜빡임 방지)
  const interval = setInterval(calculateOnlineUsers, 5000);
  
  return () => clearInterval(interval);
}, [selectedRoom?.id]); // members 의존성 제거!

const handleSearch = (query) => {
  setSearchQuery(query);
  if (!query.trim()) {
    setSearchResults([]);
    setCurrentSearchIndex(0);
    return;
  }
  
  const results = messages.filter(msg => 
    msg.text?.toLowerCase().includes(query.toLowerCase()) ||
    msg.userName?.toLowerCase().includes(query.toLowerCase())
  );
  setSearchResults(results);
  setCurrentSearchIndex(0);
  
  if (results.length > 0) {
    // 첫 번째 결과로 스크롤
    const element = document.getElementById(`msg-${results[0].id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const goToNextResult = () => {
  if (searchResults.length === 0) return;
  const nextIndex = (currentSearchIndex + 1) % searchResults.length;
  setCurrentSearchIndex(nextIndex);
  const element = document.getElementById(`msg-${searchResults[nextIndex].id}`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const goToPrevResult = () => {
  if (searchResults.length === 0) return;
  const prevIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
  setCurrentSearchIndex(prevIndex);
  const element = document.getElementById(`msg-${searchResults[prevIndex].id}`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const registerMember = (roomId) => {
  const memberRef = window.firebase.database().ref(`rooms/${roomId}/members/${user.uid}`);
  memberRef.set({
    name: user.name,
    photo: user.photo,
    joinedAt: Date.now(),
    online: true,
    lastSeen: Date.now()  // ← 추가
  });
  
  // onDisconnect 설정
  const onlineRef = window.firebase.database().ref(`rooms/${roomId}/members/${user.uid}/online`);
  onlineRef.onDisconnect().set(false);
  
  // lastSeen도 onDisconnect 설정 추가
  const lastSeenRef = window.firebase.database().ref(`rooms/${roomId}/members/${user.uid}/lastSeen`);
  lastSeenRef.onDisconnect().set(Date.now());
};

const handlePasswordSubmit = () => {
  if (pendingRoom && roomPassword === pendingRoom.password) {
    const roomRef = window.firebase.database().ref(`rooms/${pendingRoom.id}`);
    roomRef.once('value', (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        setSelectedRoom({
          id: pendingRoom.id,
          ...roomData,
          participants: 0,
          rules: roomData.rules || {chat: {}, drawing: {}, emoji: {}, quiz: {}, random: {}},
          bannedWords: roomData.bannedWords || [],
          leaders: roomData.leaders || {}  // ⭐ 추가
        });
      }
    });
    registerMember(pendingRoom.id);
    setShowPasswordModal(false);
    setRoomPassword('');
    setPendingRoom(null);
  } else {
    alert('Incorrect password!');
  }
};

const checkBannedWords = (text, roomBannedWords) => {
  if (!roomBannedWords || roomBannedWords.length === 0) return null;
  
  const lowerText = text.toLowerCase();
  for (let word of roomBannedWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return word;
    }
  }
  return null;
};

const assignLeader = (roomId, targetUserId, targetUserName, targetUserPhoto) => {
  const leadersRef = window.firebase.database().ref(`rooms/${roomId}/leaders/${targetUserId}`);
  leadersRef.set({
    type: 'assigned',
    name: targetUserName,
    photo: targetUserPhoto,
    assignedBy: user.uid,
    assignedAt: Date.now()
  }).then(() => {
    console.log('✅ Leader assigned successfully');
    showToast(`✅ ${targetUserName} is now a leader!`, 'success');
  }).catch(err => {
    console.error('❌ Leader assign error:', err);
  });
  
  // 리더 할당 메시지 전송
  const messagesRef = window.firebase.database().ref(`rooms/${roomId}/messages`);
  messagesRef.push({
    type: 'leader-assigned',
    targetUserId: targetUserId,
    targetUserName: targetUserName,
    targetUserPhoto: targetUserPhoto,
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });
};

const removeLeader = (roomId, targetUserId) => {
  const targetMember = selectedRoom.members[targetUserId];
  const leaderRef = window.firebase.database().ref(`rooms/${roomId}/leaders/${targetUserId}`);
  leaderRef.remove().then(() => {
    console.log('✅ Leader removed successfully');
    showToast(`✅ ${targetMember.name}'s leader role removed!`, 'success');
  }).catch(err => {
    console.error('❌ Leader remove error:', err);
  });
  
  // 리더 제거 메시지 전송
  const messagesRef = window.firebase.database().ref(`rooms/${roomId}/messages`);
  messagesRef.push({
    type: 'leader-removed',
    targetUserId: targetUserId,
    targetUserName: targetMember.name,
    targetUserPhoto: targetMember.photo,
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });
};

const showToast = (message, type = 'info') => {
  const now = Date.now();
  if (now - lastToastTime < 1000) return; // 1초 내 중복 방지
  
  setLastToastTime(now);
  setToast({ message, type });
  setTimeout(() => setToast(null), 3000);
};



const setRoomRule = (roomId, feature, targetUserId, action) => {
  const ruleRef = window.firebase.database().ref(`rooms/${roomId}/rules/${feature}/${targetUserId}`);
  ruleRef.set(action);
  
  // 규칙 변경 메시지 전송
  const messagesRef = window.firebase.database().ref(`rooms/${roomId}/messages`);
  const targetMember = selectedRoom.members[targetUserId];
  
  if (!targetMember) {
    console.error('Target member not found');
    return;
  }
  
  messagesRef.push({
    type: 'rule-change',
    targetUserId: targetUserId,
    targetUserName: targetMember.name,
    targetUserPhoto: targetMember.photo,
    feature: feature,
    action: action,
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });
  
  // 토스트 알림 추가
  showToast(`✅ ${targetMember.name}'s ${feature} has been ${action}!`, 'success');
};

const checkPermission = (room, feature) => {
  if (!room || !room.rules) {
    console.log('No room or rules');
    return true;
  }
  
  const userRule = room.rules[feature] && room.rules[feature][user.uid];
  console.log(`Checking ${feature} for user ${user.uid}:`, userRule);
  
  if (userRule === 'blocked') {
    console.log('User is BLOCKED');
    return false;
  }
  console.log('User is ALLOWED');
  return true;
};

const isLeader = (room) => {
  if (!room || !room.leaders) return false;
  return !!room.leaders[user.uid];
};

const isCreator = (room) => {
  if (!room || !room.leaders) return false;
  return room.leaders[user.uid]?.type === 'creator';
};

const canAssignLeader = (room) => {
  return isCreator(room);
};

const sendMessage = () => {
  if (!newMessage.trim() || !selectedRoom) return;
  
  if (!checkPermission(selectedRoom, 'chat')) {
    alert('🚫 You are blocked from chatting in this room!');
    return;
  }

  const bannedWord = checkBannedWords(newMessage, selectedRoom.bannedWords);
  if (bannedWord) {
    alert(`🚫 Your message contains a banned word: "${bannedWord}"`);
    return;
  }

  const messagesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages`);
  const newMsgRef = messagesRef.push({
    text: newMessage,
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });
  
  // 멘션 감지 및 알림 전송
  const mentionedUsers = detectMentions(newMessage);
  mentionedUsers.forEach(mentionedUserName => {
    sendMentionNotification(newMsgRef.key, mentionedUserName);
  });

  setNewMessage('');
};

const sendDrawing = () => {
  if (!canvasRef.current || !selectedRoom) return;
    if (!checkToolCooldown('drawing')) return; // ← 추가
  
  if (!checkPermission(selectedRoom, 'drawing')) {
    alert('🚫 You are blocked from sending drawings in this room!');
    return;
  }
  
  const dataURL = canvasRef.current.toDataURL();
  const messagesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages`);
  messagesRef.push({
    type: 'drawing',
    image: dataURL,
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });
  
  setShowDrawing(false);
  clearCanvas();
};

const sendEmojiMessage = () => {
  if (!selectedRoom || Object.keys(selectedEmojis).length === 0) return;
   if (!checkToolCooldown('emoji')) return; // ← 추가
  
  if (!checkPermission(selectedRoom, 'emoji')) {
    alert('🚫 You are blocked from sending emojis in this room!');
    return;
  }
  
  const emoji = Object.keys(selectedEmojis)[0];
  const count = selectedEmojis[emoji];
  
  const messagesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages`);
  messagesRef.push({
    type: 'emoji',
    emoji: emoji,
    count: Math.min(count, 5),
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });
  
  setSelectedEmojis({});
  setNewMessage('');
};

const sendQuiz = (quizData) => {
  if (!selectedRoom) return;
   if (!checkToolCooldown('quiz')) return; // ← 추가
  
  if (!checkPermission(selectedRoom, 'quiz')) {
    alert('🚫 You are blocked from creating quizzes in this room!');
    return;
  }
  
  const messagesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages`);
  messagesRef.push({
    type: 'quiz',
    question: quizData.question,
    options: quizData.options,
    correctAnswer: quizData.correctAnswer.toUpperCase(),
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now(),
    responses: {},
    revealed: false
  });
  
  setShowQuizModal(false);
  setQuizOptions(['', '', '', '']);
};

const answerQuiz = (messageId, answer, isRevealed, quizData) => {
  if (isRevealed) {
    alert('⚠️ This quiz has already been revealed!');
    return;
  }
  
  const hasParticipated = quizData.responses && quizData.responses[user.uid];
  if (hasParticipated) {
    alert('⚠️ You have already participated in this quiz!');
    return;
  }
  
  const answerIndex = quizData.options.indexOf(answer);
  const answerLetter = String.fromCharCode(65 + answerIndex);
  
  const responseRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages/${messageId}/responses/${user.uid}`);
  responseRef.set({
    answer: answerLetter,
    answerText: answer,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });
  
  const messagesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages`);
  messagesRef.push({
    type: 'quiz-participation',
    quizId: messageId,
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });
  
  alert('✅ Your answer has been submitted!');
};



const revealQuiz = (messageId, quizData) => {
  const quizRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages/${messageId}`);
  quizRef.update({ revealed: true });
  
  // 참여자들에게 결과 메시지 전송
  if (quizData.responses) {
    Object.keys(quizData.responses).forEach(participantId => {
      const response = quizData.responses[participantId];
      const isCorrect = response.answer === quizData.correctAnswer;
      
      const messagesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages`);
      messagesRef.push({
        type: 'quiz-result-personal',
        quizId: messageId,
        participantId: participantId,
        participantName: response.userName,
        isCorrect: isCorrect,
        answer: response.answer,
        correctAnswer: quizData.correctAnswer,
        userId: user.uid,
        userName: user.name,
        userPhoto: user.photo,
        timestamp: Date.now()
      });
    });
  }
  
  // 출제자에게 분석 메시지 전송
  const messagesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages`);
  
  const responses = quizData.responses || {};
  const totalParticipants = Object.keys(responses).length;
  const correctCount = Object.values(responses).filter(r => r.answer === quizData.correctAnswer).length;
  const wrongCount = totalParticipants - correctCount;
  
  // 답변 분포 계산
  const answerDistribution = {};
  Object.values(responses).forEach(r => {
    answerDistribution[r.answer] = (answerDistribution[r.answer] || 0) + 1;
  });
  
  messagesRef.push({
    type: 'quiz-analysis',
    quizId: messageId,
    question: quizData.question,
    correctAnswer: quizData.correctAnswer,
    totalParticipants: totalParticipants,
    correctCount: correctCount,
    wrongCount: wrongCount,
    answerDistribution: answerDistribution,
    participants: responses,
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });
};

const getCoordinates = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  // 터치 이벤트인 경우
  if (e.touches && e.touches[0]) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  // 마우스 이벤트인 경우
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

const startDrawing = (e) => {
  e.preventDefault(); // 터치 스크롤 방지
  setIsDrawing(true);
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const coords = getCoordinates(e, canvas);
  ctx.beginPath();
  ctx.moveTo(coords.x, coords.y);
};

const draw = (e) => {
  e.preventDefault(); // 터치 스크롤 방지
  if (!isDrawing) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const coords = getCoordinates(e, canvas);
  ctx.strokeStyle = drawColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineTo(coords.x, coords.y);
  ctx.stroke();
};

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

    const addBannedWord = (roomId, word) => {
  if (!word.trim()) return;
  
  const bannedWordsRef = window.firebase.database().ref(`rooms/${roomId}/bannedWords`);
  bannedWordsRef.once('value', (snapshot) => {
    const currentWords = snapshot.val() || [];
    if (!currentWords.includes(word.trim().toLowerCase())) {
      bannedWordsRef.set([...currentWords, word.trim().toLowerCase()]);
      showToast(`✅ Banned word added: "${word}"`, 'success');
    } else {
      alert('⚠️ This word is already banned!');
    }
  });
};

const removeBannedWord = (roomId, word) => {
  const bannedWordsRef = window.firebase.database().ref(`rooms/${roomId}/bannedWords`);
  bannedWordsRef.once('value', (snapshot) => {
    const currentWords = snapshot.val() || [];
    const newWords = currentWords.filter(w => w !== word);
    bannedWordsRef.set(newWords);
    showToast(`✅ Banned word removed: "${word}"`, 'success');
  });
};

const sendRandomPicker = (data) => {
  if (!selectedRoom) return;
  if (!checkToolCooldown('random')) return;
  
  // ⭐ 권한 체크 수정
  if (!checkPermission(selectedRoom, 'random')) {
    alert('🚫 You are blocked from creating random picker in this room!');
    setShowRandomPicker(false);  // 모달 닫기 추가
    return;
  }
  
  const roomId = selectedRoom.id;
  const messagesRef = window.firebase.database().ref(`rooms/${roomId}/messages`);
  

 
  
  if (data.mode === 'dice') {
    const newPicker = messagesRef.push({
      type: 'random-picker',
      mode: 'dice',
      delay: data.delay,
      userId: user.uid,
      userName: user.name,
      userPhoto: user.photo,
      timestamp: Date.now(),
      revealed: false,
      result: null
    });
    
    setTimeout(() => {
      revealRandomPicker(newPicker.key, roomId, { // ← roomId 파라미터 추가
        mode: 'dice',
        userId: user.uid,
        userName: user.name,
        userPhoto: user.photo
      });
    }, data.delay * 1000);
    
  } else {
    const newPicker = messagesRef.push({
      type: 'random-picker',
      mode: data.mode,
      title: data.title,
      options: data.options,
      delay: data.delay,
      userId: user.uid,
      userName: user.name,
      userPhoto: user.photo,
      timestamp: Date.now(),
      revealed: false,
      result: null
    });
    
    setTimeout(() => {
      revealRandomPicker(newPicker.key, roomId, { // ← roomId 파라미터 추가
        mode: data.mode,
        options: data.options,
        userId: user.uid,
        userName: user.name,
        userPhoto: user.photo
      });
    }, data.delay * 1000);
  }
  
  setShowRandomPicker(false);
  setRandomOptions(['', '', '', '']);
  setRandomDelay(3);
};

const revealRandomPicker = (messageId, roomId, pickerData) => {
  console.log('🔍 Revealing random picker:', { messageId, roomId, pickerData });
  
  let result;
  let resultIndex;
  
  if (pickerData.mode === 'dice') {
    result = Math.floor(Math.random() * 6) + 1;
    resultIndex = null; // ← undefined 대신 null 사용
  } else {
    resultIndex = Math.floor(Math.random() * pickerData.options.length);
    result = pickerData.options[resultIndex];
  }
  
  console.log('🎲 Result:', result, 'Index:', resultIndex);
  
  const pickerRef = window.firebase.database().ref(`rooms/${roomId}/messages/${messageId}`);
  
  // update 객체를 조건부로 구성
  const updateData = { 
    revealed: true,
    result: result
  };
  
  if (resultIndex !== null) { // ← resultIndex가 null이 아닐 때만 추가
    updateData.resultIndex = resultIndex;
  }
  
  pickerRef.update(updateData).then(() => {
    console.log('✅ Picker updated successfully');
  }).catch(err => {
    console.error('❌ Picker update error:', err);
  });
  
  const messagesRef = window.firebase.database().ref(`rooms/${roomId}/messages`);
  
  let resultMessage = '';
  if (pickerData.mode === 'race') {
    resultMessage = `🏁 ${result} wins the race!`;
  } else if (pickerData.mode === 'beauty') {
    resultMessage = `👑 ${result} is the most beautiful!`;
  } else if (pickerData.mode === 'lucky') {
    resultMessage = `🍀 ${result} is today's lucky person!`;
  } else if (pickerData.mode === 'dice') {
    resultMessage = `🎲 The dice rolled: ${result}`;
  }
  
  console.log('📨 Sending result message:', resultMessage);
  
  messagesRef.push({
    type: 'random-result',
    mode: pickerData.mode,
    result: result,
    message: resultMessage,
    userId: pickerData.userId,
    userName: pickerData.userName,
    userPhoto: pickerData.userPhoto,
    timestamp: Date.now()
  }).then(() => {
    console.log('✅ Result message sent successfully');
  }).catch(err => {
    console.error('❌ Result message error:', err);
  });
};

const checkToolCooldown = (toolName) => {
  const now = Date.now();
  const lastUsed = lastToolUsage[toolName] || 0;
  const timeSinceLastUse = now - lastUsed;
  
  if (timeSinceLastUse < TOOL_COOLDOWN) {
    const remainingTime = Math.ceil((TOOL_COOLDOWN - timeSinceLastUse) / 1000);
    showToast(`⏱️ Please wait ${remainingTime} seconds before using this tool again!`, 'error');
    return false;
  }
  
  setLastToolUsage(prev => ({ ...prev, [toolName]: now }));
  return true;
};

const detectMentions = (text) => {
  const mentionRegex = /@(\S+)/g;
  const matches = [...text.matchAll(mentionRegex)];
  return matches.map(match => match[1]);
};

const sendMentionNotification = (messageId, mentionedUserName) => {
  if (!selectedRoom || !selectedRoom.members) return;
  
  // 멘션된 사용자 찾기
  const mentionedUser = Object.entries(selectedRoom.members).find(
    ([uid, member]) => member.name.toLowerCase() === mentionedUserName.toLowerCase()
  );
  
  if (!mentionedUser) return;
  
  const [mentionedUid, mentionedUserData] = mentionedUser;
  
  // 자기 자신은 제외
  if (mentionedUid === user.uid) return;
  
  // 온라인 상태 확인
  if (!mentionedUserData.online) return;
  
  // 멘션 알림 전송
  const mentionRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/mentions/${mentionedUid}`);
  mentionRef.push({
    messageId: messageId,
    fromUserId: user.uid,
    fromUserName: user.name,
    fromUserPhoto: user.photo,
    timestamp: Date.now()
  });
};


  const createFeedPost = () => {
    const content = prompt('Share something with the world:');
    if (!content) return;

    const feedRef = window.firebase.database().ref('feed');
    feedRef.push({
      content,
      userId: user.uid,
      userName: user.name,
      userPhoto: user.photo,
      timestamp: Date.now(),
      likes: 0,
      comments: 0
    });
  };

  const createCommunityPost = () => {
    const title = prompt('Post title:');
    if (!title) return;
    const content = prompt('Post content:');
    if (!content) return;

    const communityRef = window.firebase.database().ref('community');
    communityRef.push({
      title,
      content,
      userId: user.uid,
      userName: user.name,
      userPhoto: user.photo,
      timestamp: Date.now(),
      likes: 0,
      comments: 0,
      views: 0
    });
  };

  const likePost = (postId, currentLikes, type) => {
    const ref = window.firebase.database().ref(`${type}/${postId}`);
    ref.update({ likes: (currentLikes || 0) + 1 });
  };

  

  // 로그인 화면
  if (!user) {
   return (
 <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* 애니메이션 배경 효과 */}
        <div className="absolute inset-0">
          {/* 회전하는 그라데이션 원들 */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          
          {/* 움직이는 선들 */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.5) 2px, transparent 2px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.5) 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px',
            animation: 'moveGrid 20s linear infinite'
          }}></div>
        </div>

        <style>{`
          @keyframes moveGrid {
            0% { background-position: 0 0; }
            100% { background-position: 60px 60px; }
          }
        `}</style>

        <div className="bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative z-10 border border-cyan-500/30">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur"></div>
          <div className="relative bg-gray-800 rounded-3xl p-8">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <MessageCircle className="w-24 h-24 mx-auto text-cyan-400 mb-4 relative" />
              </div>
              <h1 className="text-5xl font-black mb-2">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Unvul Chat !!
                </span>
              </h1>
              <p className="text-gray-400 font-semibold text-lg">Connect • Share • Discover</p>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-left bg-gray-700/50 p-4 rounded-2xl border border-cyan-500/30 transform hover:scale-105 transition-all">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-200 font-semibold">Real-time chat rooms</span>
              </div>
              <div className="flex items-center gap-3 text-left bg-gray-700/50 p-4 rounded-2xl border border-purple-500/30 transform hover:scale-105 transition-all">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-200 font-semibold">Global feed & stories</span>
              </div>
              <div className="flex items-center gap-3 text-left bg-gray-700/50 p-4 rounded-2xl border border-pink-500/30 transform hover:scale-105 transition-all">
                <div className="bg-gradient-to-br from-pink-500 to-red-600 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-200 font-semibold">Community discussions</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <svg className="w-7 h-7 relative z-10" viewBox="0 0 24 24">
                <path fill="#FFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#FFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#FFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-lg relative z-10">Continue with Google</span>
              <Sparkles className="w-6 h-6 animate-pulse relative z-10" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 메인 앱
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* 고급 배경 효과 - 다층 구조 */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 그라데이션 구체들 */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
        
        {/* 그리드 패턴 (움직임) */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.5) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '50px 50px',
          animation: 'moveGrid 30s linear infinite'
        }}></div>
        
        {/* 점 패턴 */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `radial-gradient(circle, rgba(6, 182, 212, 0.4) 1.5px, transparent 1.5px)`,
          backgroundSize: '30px 30px'
        }}></div>
        
        {/* 대각선 패턴 */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            rgba(139, 92, 246, 0.4) 40px,
            rgba(139, 92, 246, 0.4) 42px
          )`
        }}></div>
        
        {/* 원형 패턴 */}
        <div className="absolute inset-0 opacity-8" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 35%, transparent 18%, rgba(236, 72, 153, 0.15) 19%, rgba(236, 72, 153, 0.15) 20%, transparent 21%),
            radial-gradient(circle at 75% 65%, transparent 18%, rgba(139, 92, 246, 0.15) 19%, rgba(139, 92, 246, 0.15) 20%, transparent 21%)
          `,
          backgroundSize: '250px 250px'
        }}></div>
        
        {/* 헥사곤 느낌의 패턴 */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(30deg, transparent 47%, rgba(6, 182, 212, 0.3) 48%, rgba(6, 182, 212, 0.3) 52%, transparent 53%),
            linear-gradient(-30deg, transparent 47%, rgba(6, 182, 212, 0.3) 48%, rgba(6, 182, 212, 0.3) 52%, transparent 53%)
          `,
          backgroundSize: '70px 40px'
        }}></div>
        
        {/* 빛나는 세로 라인들 */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"></div>
        <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-pink-500/20 to-transparent"></div>
        
        {/* 움직이는 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse"></div>
        
        {/* 별 같은 점들 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="absolute top-[25%] right-[20%] w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-[30%] left-[30%] w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-[60%] right-[40%] w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-[15%] right-[25%] w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      <style>{`
        @keyframes moveGrid {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
      `}</style>

      {/* Header */}
      {!isFullscreen && (
     <header className="bg-gray-800/90 backdrop-blur-2xl border-b border-cyan-500/30 sticky top-0 z-50 shadow-2xl relative">
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
    
    {/* 로고 - 모바일에서 간소화 */}
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-gradient-to-br from-cyan-500 to-purple-600 p-2 rounded-2xl">
          <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
      </div>
      <div>
        <h1 className="text-lg md:text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-1">
          Unvul Chat
          <Crown className="w-3 h-3 md:w-5 md:h-5 text-yellow-400" />
        </h1>
        {/* 모바일에서 숨김 */}
        <div className="hidden sm:flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-gray-400 font-medium">Made By Unvul® Ver 2.0</span>
        </div>
      </div>
    </div>

    {/* 네비게이션 - 모바일 최적화 */}
    <nav className="flex gap-1 md:gap-2 bg-gray-700/50 rounded-xl md:rounded-2xl p-1 md:p-1.5 border border-cyan-500/30 backdrop-blur-xl">
      <button
        onClick={() => setCurrentView('chat')}
        className={`px-2 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-1 md:gap-2 transition-all font-bold text-sm md:text-base ${
          currentView === 'chat' 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50' 
            : 'text-gray-300 hover:bg-gray-600'
        }`}
      >
        <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
        <span className="hidden sm:inline">Chat</span>
      </button>
      <button
        onClick={() => setCurrentView('feed')}
        className={`px-2 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-1 md:gap-2 transition-all font-bold text-sm md:text-base ${
          currentView === 'feed' 
            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50' 
            : 'text-gray-300 hover:bg-gray-600'
        }`}
      >
        <Globe className="w-4 h-4 md:w-5 md:h-5" />
        <span className="hidden sm:inline">Feed</span>
      </button>
      <button
        onClick={() => setCurrentView('community')}
        className={`px-2 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-1 md:gap-2 transition-all font-bold text-sm md:text-base ${
          currentView === 'community' 
            ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg shadow-pink-500/50' 
            : 'text-gray-300 hover:bg-gray-600'
        }`}
      >
        <Users className="w-4 h-4 md:w-5 md:h-5" />
        <span className="hidden sm:inline">Community</span>
      </button>
    </nav>

    {/* 우측 아이콘 - 모바일 최적화 */}
    <div className="flex items-center gap-1 md:gap-3">
      {/* 모바일에서 알림/검색 숨김 */}
      <button 
        onClick={() => setShowSearch(!showSearch)}
        className="hidden md:block relative text-gray-400 hover:text-cyan-400 p-2 rounded-xl hover:bg-gray-700/50 transition-all"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
      </button>
      
      <button 
        onClick={() => setShowUserSettings(true)}
        className="text-gray-400 hover:text-cyan-400 p-1.5 md:p-2 rounded-xl hover:bg-gray-700/50 transition-all"
      >
        <Settings className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      
      {/* 프로필 이미지 크기 조정 */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-75 transition"></div>
        <img src={user.photo} alt={user.name} className="relative w-8 h-8 md:w-11 md:h-11 rounded-full border-2 border-cyan-400 shadow-lg" />
        <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
      </div>
      
      <button
        onClick={handleLogout}
        className="text-gray-400 hover:text-red-400 hover:bg-gray-700/50 p-1.5 md:p-2.5 rounded-xl transition-all"
      >
        <LogOut className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  </div>
</header>
      )}

     


      {/* Chat View */}
     {currentView === 'chat' && (
  <div className={`${isFullscreen ? '' : 'max-w-7xl mx-auto p-4'} relative z-10`}>
<div className={`${isFullscreen ? '' : 'grid md:grid-cols-3 gap-4 h-[calc(100vh-140px)]'}`}>           <div className={`bg-gray-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 overflow-y-auto border border-cyan-500/30 relative transition-all duration-300 ${
  isFullscreen ? 'hidden' : showRoomList ? 'fixed md:relative inset-x-4 bottom-4 top-auto md:inset-auto z-50 max-h-[70vh]' : 'hidden md:block'
}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-5 relative">
                <h2 className="text-xl font-black text-cyan-400 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Chat Rooms
                  <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded-full text-cyan-300">{rooms.length}</span>
                </h2>
                <button
                  onClick={() => setShowCreateRoom(!showCreateRoom)}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition"></div>
                  <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-2.5 rounded-xl hover:shadow-xl transition-all">
                    <Plus className="w-5 h-5" />
                  </div>
                </button>
              </div>

              {showCreateRoom && (
                <div className="mb-4 p-4 bg-gray-700/50 rounded-2xl border border-cyan-500/30 backdrop-blur-xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl pointer-events-none"></div>
                  <div className="relative space-y-3">
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Room name"
                        id="roomName"
                        className="w-full pl-10 pr-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-xl focus:border-cyan-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Password (optional)"
                        id="roomPassword"
                        className="w-full pl-10 pr-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-xl focus:border-cyan-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const name = document.getElementById('roomName').value;
                          const password = document.getElementById('roomPassword').value;
                          if (name) {
                            createRoom({ name, password });
                            document.getElementById('roomName').value = '';
                            document.getElementById('roomPassword').value = '';
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                      >
                        Create Room
                      </button>
                      <button
                        onClick={() => setShowCreateRoom(false)}
                        className="px-5 bg-gray-600 text-gray-300 rounded-xl hover:bg-gray-500 font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

           <div className="space-y-3 relative">
  {rooms.map(room => {
    const userRole = room.leaders && room.leaders[user.uid];
    const isRoomCreator = userRole?.type === 'creator';
    const isAssignedLeader = userRole?.type === 'assigned';
    
    return (
      <div
        key={room.id}
        onClick={() => joinRoom(room)}
        className={`relative p-4 rounded-2xl cursor-pointer transition-all group ${
          selectedRoom?.id === room.id
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/50 scale-105'
            : `${
                isRoomCreator 
                  ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50' 
                  : isAssignedLeader 
                  ? 'bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-2 border-yellow-500/50'
                  : 'bg-gray-700/50 border border-gray-600'
              } hover:bg-gray-700 text-gray-200 hover:border-cyan-500/50`
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className={`w-5 h-5 ${
              selectedRoom?.id === room.id 
                ? 'text-white' 
                : isRoomCreator 
                ? 'text-green-400' 
                : isAssignedLeader 
                ? 'text-yellow-400'
                : 'text-cyan-400'
            }`} />
            <span className="font-bold text-lg">{room.name}</span>
            {isRoomCreator && <Crown className="w-5 h-5 text-green-400" />}
            {isAssignedLeader && <Star className="w-5 h-5 text-yellow-400" />}
          </div>
          <div className="flex items-center gap-2">
            {room.hasPassword && <Lock className="w-5 h-5" />}
            {selectedRoom?.id === room.id && <Sparkles className="w-5 h-5 animate-pulse" />}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm mt-2 opacity-75">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{room.participants || 0}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Active</span>
          </div>
          {isRoomCreator && (
            <>
              <span>•</span>
              <span className="text-green-400 font-bold text-xs">Creator</span>
            </>
          )}
          {isAssignedLeader && (
            <>
              <span>•</span>
              <span className="text-yellow-400 font-bold text-xs">Leader</span>
            </>
          )}
        </div>
      </div>
    );
  })}
</div>
</div>

{/* 🔥 여기에 추가! */}
{selectedRoom && (
  <button
    onClick={() => setShowRoomList(!showRoomList)}
    className="md:hidden w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 flex items-center justify-center gap-2 font-bold hover:from-cyan-600 hover:to-blue-700 transition-all border-b border-cyan-400/30 relative z-10"
  >
    {showRoomList ? (
      <>
        <ChevronDown className="w-5 h-5" />
        Hide Rooms
      </>
    ) : (
      <>
        <ChevronUp className="w-5 h-5" />
        Show Rooms
      </>
    )}
  </button>
)}

            {/* Chat Area */}
            
<div className={`${isFullscreen ? 'fixed inset-0 z-[100] bg-gray-900 rounded-none h-screen max-h-screen' : 'md:col-span-2 rounded-2xl'} bg-gray-800/90 backdrop-blur-2xl shadow-2xl flex flex-col border border-cyan-500/30 relative overflow-hidden`}>              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl pointer-events-none"></div>
              
              {selectedRoom ? (
                <>
                <div className={`p-5 border-b border-gray-700 bg-gray-700/50 backdrop-blur-xl relative z-10 ${isFullscreen ? 'flex-shrink-0' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>

                        <div>
                          <h3 className="font-black text-cyan-400 text-xl flex items-center gap-2">
                            {selectedRoom.name}
                            <Shield className="w-5 h-5 text-yellow-400" />
                          </h3>
<p className="text-xs text-gray-400 flex items-center gap-2">
  <Users className="w-3 h-3" />
  {onlineCount} members online
</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
<button 
  onClick={() => setIsFullscreen(!isFullscreen)}
  className="p-2 hover:bg-gray-600 rounded-xl transition-all text-gray-400 hover:text-cyan-400"
>
  {isFullscreen ? <X className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
</button>



<button 
  onClick={() => setShowSearch(!showSearch)}
  className="p-2 hover:bg-gray-600 rounded-xl transition-all text-gray-400 hover:text-cyan-400"
>
  <Search className="w-5 h-5" />
</button>
  <button className="p-2 hover:bg-gray-600 rounded-xl transition-all text-gray-400 hover:text-cyan-400">
    <Filter className="w-5 h-5" />
  </button>
  {isLeader(selectedRoom) && (
    <button 
      onClick={() => setShowRoomSettings(true)}
      className="p-2 hover:bg-gray-600 rounded-xl transition-all text-gray-400 hover:text-yellow-400"
    >
      <Shield className="w-5 h-5" />
    </button>
  )}
  <button className="p-2 hover:bg-gray-600 rounded-xl transition-all text-gray-400 hover:text-cyan-400">
    <Menu className="w-5 h-5" />
  </button>
</div>

                    </div>
                  </div>

                  {showSearch && (
  <div className="p-3 border-b border-gray-700 bg-gray-700/80 backdrop-blur-xl">
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search messages..."
          className="w-full pl-10 pr-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-xl focus:border-cyan-500 focus:outline-none transition-all text-sm"
          autoFocus
        />
      </div>
      {searchResults.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">
            {currentSearchIndex + 1} / {searchResults.length}
          </span>
          <button
            onClick={goToPrevResult}
            className="p-2 hover:bg-gray-600 rounded-lg transition-all text-gray-400 hover:text-cyan-400"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextResult}
            className="p-2 hover:bg-gray-600 rounded-lg transition-all text-gray-400 hover:text-cyan-400"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
      <button
        onClick={() => {
          setShowSearch(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
        className="p-2 hover:bg-gray-600 rounded-lg transition-all text-gray-400 hover:text-red-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
)}
                  



<div className="flex-1 overflow-y-auto p-5 space-y-4 relative">                    {messages.map(msg => (
                     <div 
  key={msg.id} 
  id={`msg-${msg.id}`}
  className={`flex gap-3 ${msg.userId === user.uid ? 'flex-row-reverse' : ''} group ${
    searchResults.find(r => r.id === msg.id) ? 'bg-yellow-500/20 rounded-xl p-2 -m-2' : ''
  }`}
>
  <div className="relative flex-shrink-0">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-50 transition"></div>
    <img src={msg.userPhoto} alt={msg.userName} className="relative w-11 h-11 rounded-full border-2 border-cyan-400" />
  </div>
  
  <div className={`flex flex-col ${msg.userId === user.uid ? 'items-end' : 'items-start'} max-w-xs`}>
    <div className="text-xs text-gray-400 mb-1.5 font-bold flex items-center gap-2">
      {msg.userName}
      <Star className="w-3 h-3 text-yellow-400" />
    </div>

    
    
    {msg.type === 'drawing' ? (
      <div 
        onClick={() => setExpandedImage(msg.image)}
        className="cursor-pointer relative group/img"
      >
        <img 
          src={msg.image} 
          alt="Drawing" 
          className="rounded-2xl max-w-xs border-2 border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/50 transition-all"
        />
        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all rounded-2xl flex items-center justify-center pointer-events-none">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover/img:opacity-100 transition-all" />
        </div>
      </div>
) : msg.type === 'emoji' ? (
  <div 
    className="transform hover:scale-110 transition-transform font-bold"
    style={{ 
      fontSize: `${Math.min(msg.count * 2, 10)}rem`,
      transition: 'all 0.3s ease'
    }}
  >
    {msg.emoji}
  </div>

) : msg.type === 'rule-change' ? (
  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border border-orange-500/30 backdrop-blur-xl text-center">
    <div className="text-orange-300 text-sm font-bold flex items-center justify-center gap-2">
      <Shield className="w-4 h-4" />
      <span className="font-black">{msg.targetUserName}</span>'s rule has been changed
    </div>
    <div className="text-xs text-gray-400 mt-1">
      {msg.feature.toUpperCase()}: {msg.action === 'blocked' ? '🚫 Blocked' : '✅ Allowed'}
    </div>
  </div>
) : msg.type === 'leader-assigned' ? (
  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border border-yellow-500/30 backdrop-blur-xl text-center">
    <div className="text-yellow-300 text-sm font-bold flex items-center justify-center gap-2">
      <Crown className="w-4 h-4" />
      <span className="font-black">{msg.targetUserName}</span> has been assigned as a leader!
    </div>
  </div>
) : msg.type === 'leader-removed' ? (
  <div className="p-3 rounded-xl bg-gradient-to-br from-red-900/30 to-rose-900/30 border border-red-500/30 backdrop-blur-xl text-center">
    <div className="text-red-300 text-sm font-bold flex items-center justify-center gap-2">
      <X className="w-4 h-4" />
      <span className="font-black">{msg.targetUserName}</span>'s leader role has been removed
    </div>
  </div>

  ) : msg.type === 'random-picker' ? (
  <div className={`p-4 rounded-2xl backdrop-blur-xl max-w-md border-2 ${
    msg.mode === 'race' ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500' :
    msg.mode === 'beauty' ? 'bg-gradient-to-br from-pink-900/50 to-purple-900/50 border-pink-500' :
    msg.mode === 'lucky' ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500' :
    'bg-gradient-to-br from-red-900/50 to-rose-900/50 border-red-500'
  }`}>
    <div className="font-bold text-center mb-3 flex items-center justify-center gap-2">
      {msg.mode === 'race' && <><Trophy className="w-5 h-5 text-blue-300" /><span className="text-blue-300">🏁 Race Competition</span></>}
      {msg.mode === 'beauty' && <><Crown className="w-5 h-5 text-pink-300" /><span className="text-pink-300">👑 Beauty Contest</span></>}
      {msg.mode === 'lucky' && <><Star className="w-5 h-5 text-yellow-300" /><span className="text-yellow-300">🍀 Lucky Draw</span></>}
      {msg.mode === 'dice' && <><Zap className="w-5 h-5 text-red-300" /><span className="text-red-300">🎲 Dice Roll</span></>}
    </div>
    
    {msg.title && <div className="text-center text-white font-bold mb-3">{msg.title}</div>}
    
    {msg.mode !== 'dice' ? (
      <div className="space-y-2 mb-3">
        {msg.options.map((opt, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg text-sm transition-all ${
              msg.revealed && msg.resultIndex === idx
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black scale-105 animate-pulse'
                : 'bg-gray-700/50 text-gray-300'
            }`}
          >
            <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
            {opt}
            {msg.revealed && msg.resultIndex === idx && <span className="ml-2">🎉</span>}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-6">
        <div className={`text-6xl mb-2 ${msg.revealed ? 'animate-bounce' : ''}`}>
          {msg.revealed ? `🎲 ${msg.result}` : '🎲'}
        </div>
        {msg.revealed && (
          <div className="text-yellow-300 font-bold text-xl mt-2">
            You rolled {msg.result}!
          </div>
        )}
      </div>
    )}
    
    {!msg.revealed && (
      <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 animate-spin" />
        Revealing in {msg.delay} seconds...
      </div>
    )}
    

  </div>
) : msg.type === 'random-result' ? (
  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-2 border-green-500 backdrop-blur-xl text-center">
    <div className="text-2xl mb-2">🎉</div>
    <div className="text-green-300 font-bold text-lg">{msg.message}</div>
  </div>

) : msg.type === 'quiz' ? (
  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500 backdrop-blur-xl max-w-md">
    <div className="font-bold text-purple-300 mb-3 flex items-center gap-2">
      <HelpCircle className="w-5 h-5" />
      {msg.question}
    </div>
    <div className="space-y-2 mb-3">
      {msg.options.map((opt, idx) => (
        <button
          key={idx}
          onClick={() => answerQuiz(msg.id, opt, msg.revealed, msg)}
          disabled={msg.revealed || (msg.responses && msg.responses[user.uid])}
          className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
            msg.revealed || (msg.responses && msg.responses[user.uid])
              ? 'bg-gray-800/50 cursor-not-allowed opacity-50' 
              : 'bg-gray-700/50 hover:bg-purple-600 border-purple-500/30 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50'
          }`}
        >
          <span className="font-bold text-purple-300 mr-2">{String.fromCharCode(65 + idx)}.</span>
          {opt}
          {msg.revealed && String.fromCharCode(65 + idx) === msg.correctAnswer && (
            <span className="ml-2 text-green-400 font-bold">✓ Correct!</span>
          )}
        </button>
      ))}
    </div>
    
    <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
      <Users className="w-4 h-4" />
      {msg.responses ? Object.keys(msg.responses).length : 0} participant(s)
    </div>
    
    {msg.userId === user.uid && !msg.revealed && (
      <button
        onClick={() => revealQuiz(msg.id, msg)}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
      >
        <Award className="w-4 h-4" />
        Reveal Answer ({msg.responses ? Object.keys(msg.responses).length : 0} responses)
      </button>
    )}
    {msg.revealed && (
      <div className="text-center text-sm text-gray-400 mt-2 flex items-center justify-center gap-2">
        <Shield className="w-4 h-4" />
        Quiz Ended - Answer: {msg.correctAnswer}
      </div>
    )}
  </div>
) : msg.type === 'quiz-participation' ? (
  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 backdrop-blur-xl text-center">
    <div className="text-blue-300 text-sm font-bold flex items-center justify-center gap-2">
      <Award className="w-4 h-4" />
      <span className="font-black">{msg.userName}</span> has participated!
    </div>
  </div>
) : msg.type === 'quiz-result-personal' ? (
  msg.participantId === user.uid ? (
    <div className={`p-4 rounded-2xl backdrop-blur-xl border-2 ${
      msg.isCorrect 
        ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500' 
        : 'bg-gradient-to-br from-red-900/50 to-orange-900/50 border-red-500'
    }`}>
      <div className={`font-bold text-center mb-2 flex items-center justify-center gap-2 ${
        msg.isCorrect ? 'text-green-300' : 'text-red-300'
      }`}>
        {msg.isCorrect ? (
          <>
            <Award className="w-6 h-6" />
            🎉 Correct Answer!
          </>
        ) : (
          <>
            <X className="w-6 h-6" />
            ❌ Wrong Answer
          </>
        )}
      </div>
      <div className="text-sm text-gray-300 text-center">
        Your answer: <span className="font-bold text-white">{msg.answer}</span>
        {!msg.isCorrect && (
          <>
            <br />
            Correct answer: <span className="font-bold text-green-400">{msg.correctAnswer}</span>
          </>
        )}
      </div>
    </div>
  ) : null
) : msg.type === 'quiz-analysis' ? (
  msg.userId === user.uid ? (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-2 border-indigo-500 backdrop-blur-xl max-w-md">
      <div className="font-black text-indigo-300 mb-4 flex items-center gap-2 text-lg">
        <TrendingUp className="w-6 h-6" />
        Quiz Analysis
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="bg-gray-800/50 p-3 rounded-xl">
          <div className="text-xs text-gray-400 mb-1">Question</div>
          <div className="text-white font-bold">{msg.question}</div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-900/30 p-3 rounded-xl text-center border border-blue-500/30">
            <div className="text-2xl font-black text-blue-300">{msg.totalParticipants}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-green-900/30 p-3 rounded-xl text-center border border-green-500/30">
            <div className="text-2xl font-black text-green-300">{msg.correctCount}</div>
            <div className="text-xs text-gray-400">Correct</div>
          </div>
          <div className="bg-red-900/30 p-3 rounded-xl text-center border border-red-500/30">
            <div className="text-2xl font-black text-red-300">{msg.wrongCount}</div>
            <div className="text-xs text-gray-400">Wrong</div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-3 rounded-xl">
          <div className="text-xs text-gray-400 mb-2">Answer Distribution</div>
          <div className="space-y-1">
            {Object.entries(msg.answerDistribution).map(([answer, count]) => (
              <div key={answer} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${answer === msg.correctAnswer ? 'text-green-400' : 'text-gray-300'}`}>
                    {answer}
                  </span>
                  {answer === msg.correctAnswer && <span className="text-green-400 text-xs">✓</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-700 rounded-full h-2 w-20">
                    <div 
                      className={`h-2 rounded-full ${answer === msg.correctAnswer ? 'bg-green-500' : 'bg-gray-500'}`}
                      style={{ width: `${(count / msg.totalParticipants) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-3 rounded-xl">
          <div className="text-xs text-gray-400 mb-2">Participants</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {Object.values(msg.participants).map((participant, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <img src={participant.userPhoto} alt={participant.userName} className="w-6 h-6 rounded-full" />
                  <span className="text-gray-300">{participant.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${participant.answer === msg.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
                    {participant.answer}
                  </span>
                  {participant.answer === msg.correctAnswer ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <Award className="w-4 h-4 text-yellow-400" />
        Accuracy: {msg.totalParticipants > 0 ? Math.round((msg.correctCount / msg.totalParticipants) * 100) : 0}%
      </div>
    </div>
  ) : null) : msg.type === 'quiz-result' ? (
  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-500 backdrop-blur-xl text-center">
    <div className="text-green-300 font-bold flex items-center justify-center gap-2">
      <Award className="w-5 h-5" />
      Quiz Results Revealed!
    </div>
  </div>
) : (
  <div 
    onClick={() => {
      navigator.clipboard.writeText(msg.text);
      showToast('📋 Message copied!', 'success');
    }}
    className={`p-4 rounded-2xl shadow-lg relative cursor-pointer ${
      msg.userId === user.uid
        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:shadow-xl'
        : 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-650'
    } transition-all`}
  >
    {msg.text && msg.text.split(/(@\S+|https?:\/\/[^\s]+)/g).map((part, idx) => {
      if (part.startsWith('@')) {
        const mentionedName = part.slice(1);
        const isMe = mentionedName.toLowerCase() === user.name.toLowerCase();
        return (
          <span
            key={idx}
            className={`font-bold ${
              isMe 
                ? 'bg-yellow-400 text-gray-900 px-1 rounded' 
                : 'text-cyan-300'
            }`}
          >
            {part}
          </span>
        );
} else if (part.match(/^https?:\/\//)) {
  return (
    <a
      key={idx}
      href={part}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="underline text-blue-300 hover:text-blue-200 font-bold break-all"
    >
      {part}
    </a>
  );
}
      return <span key={idx}>{part}</span>;
    })}
  </div>
)}
    
    <div className={`text-[10px] text-gray-400 mt-1 ${msg.userId === user.uid ? 'text-right' : 'text-left'}`}>
      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
    </div>
  </div>
</div>

                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                 <div className={`p-5 border-t border-gray-700 bg-gray-700/50 backdrop-blur-xl relative z-10 ${isFullscreen ? 'flex-shrink-0' : ''}`}>
                    {showEmojiPicker && (
  <div className="absolute bottom-full mb-2 left-5 bg-gray-800 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-bold text-cyan-400 flex items-center gap-2">
        <Smile className="w-4 h-4" />
        Pick an Emoji
      </span>
      <button onClick={() => {
        setShowEmojiPicker(false);
        setSelectedEmojis({});
      }} className="text-gray-400 hover:text-red-400">
        <X className="w-4 h-4" />
      </button>
    </div>
    <div className="grid grid-cols-8 gap-2">
      {emojis.map(emoji => {
        const isSelected = selectedEmojis[emoji];
        const count = selectedEmojis[emoji] || 0;
        return (
          <button
            key={emoji}
onClick={() => {
  setSelectedEmojis(prev => ({
    [emoji]: Math.min((prev[emoji] || 0) + 1, 5)
  }));
}}



            className={`relative text-2xl hover:scale-125 transition-transform p-2 rounded-lg ${
              isSelected 
                ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 ring-2 ring-cyan-400' 
                : 'bg-gray-700 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-purple-500/20'
            }`}
          >
            {emoji}
            {isSelected && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>

)}

{showMentionList && selectedRoom && selectedRoom.members && (
  <div className="absolute bottom-full mb-2 left-5 bg-gray-800 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 w-64">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-bold text-cyan-400 flex items-center gap-2">
        <AtSign className="w-4 h-4" />
        Mention Someone
      </span>
      <button onClick={() => setShowMentionList(false)} className="text-gray-400 hover:text-red-400">
        <X className="w-4 h-4" />
      </button>
    </div>
    
    <input
      type="text"
      value={mentionSearch}
      onChange={(e) => setMentionSearch(e.target.value)}
      placeholder="Search users..."
      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-cyan-500 focus:outline-none transition-all text-sm mb-2"
    />
    
<div className="space-y-1 max-h-48 overflow-y-auto">
  {onlineUsers
    .filter(([uid, member]) => 
      member.name.toLowerCase().includes(mentionSearch.toLowerCase())
    )
    .map(([uid, member]) => (
      <button
        key={uid}
        onClick={() => {
          setNewMessage(prev => prev + `@${member.name} `);
          setShowMentionList(false);
          setMentionSearch('');
        }}
        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-all text-left"
      >
        <div className="relative">
          <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full border-2 border-cyan-400" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">{member.name}</div>
          <div className="text-xs text-gray-400">Online</div>
        </div>
      </button>
    ))}
</div>
  </div>
)}

{/* 멘션 알림 - 도구 바 바로 위에 추가 */}
{mentions.length > 0 && (
  <div className="mb-3 space-y-2">
    {mentions.map(mention => (
      <div
        key={mention.id}
        className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-4"
      >
        <img src={mention.fromUserPhoto} alt={mention.fromUserName} className="w-10 h-10 rounded-full border-2 border-cyan-400" />
        <div className="flex-1">
          <div className="text-white font-bold text-sm flex items-center gap-2">
            <AtSign className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400">{mention.fromUserName}</span> mentioned you!
          </div>
          <div className="text-xs text-gray-400">Click to view message</div>
        </div>
        <button
          onClick={() => {
            const element = document.getElementById(`msg-${mention.messageId}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setMentions(prev => prev.filter(m => m.id !== mention.id));
          }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded-lg text-sm font-bold transition-all"
        >
          View
        </button>
      </div>
    ))}
  </div>
)}

{/* 도구 바 */}
<div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition"></div>
                        <div className="relative bg-gray-600 p-2 rounded-lg hover:bg-yellow-600 transition-all flex items-center gap-1">
                          <Smile className="w-5 h-5 text-white" />
                          <ChevronUp className="w-3 h-3 text-white" />
                        </div>
                      </button>
                      <button
                        onClick={() => setShowDrawing(true)}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition"></div>
                        <div className="relative bg-gray-600 p-2 rounded-lg hover:bg-purple-600 transition-all">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                      </button>
                      <button
                        onClick={() => setShowQuizModal(true)}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition"></div>
                        <div className="relative bg-gray-600 p-2 rounded-lg hover:bg-pink-600 transition-all">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                      </button>
<button
  onClick={() => setShowRandomPicker(true)}
  className="relative group"
>
  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition"></div>
  <div className="relative bg-gray-600 p-2 rounded-lg hover:bg-green-600 transition-all">
    <Zap className="w-5 h-5 text-white" />
  </div>
</button>

<button
  onClick={() => setShowMentionList(!showMentionList)}
  className="relative group"
>
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition"></div>
  <div className="relative bg-gray-600 p-2 rounded-lg hover:bg-blue-600 transition-all">
    <AtSign className="w-5 h-5 text-white" />
  </div>
</button>
</div>
                    
<div className="flex gap-3">
  <div className="flex-1 relative">
    <input
      type="text"
      value={Object.keys(selectedEmojis).length > 0 
        ? `${Object.keys(selectedEmojis)[0]} x${selectedEmojis[Object.keys(selectedEmojis)[0]]}`
        : newMessage
      }
      onChange={(e) => {
        if (Object.keys(selectedEmojis).length === 0) {
          setNewMessage(e.target.value);
        }
      }}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          if (Object.keys(selectedEmojis).length > 0) {
            sendEmojiMessage();
          } else {
            sendMessage();
          }
        }
      }}
      placeholder="Type a message..."
      className="w-full px-5 py-3 bg-gray-600 border border-gray-500 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
      readOnly={Object.keys(selectedEmojis).length > 0}
    />
    {Object.keys(selectedEmojis).length > 0 && (
      <button
        onClick={() => setSelectedEmojis({})}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-all"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
  <button
    onClick={() => {
      if (Object.keys(selectedEmojis).length > 0) {
        sendEmojiMessage();
      } else {
        sendMessage();
      }
    }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-100 transition"></div>
    <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3.5 rounded-2xl hover:shadow-xl hover:shadow-cyan-500/50 transition-all">
      <Send className="w-6 h-6" />
    </div>
  </button>
</div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                      <MessageCircle className="w-24 h-24 relative text-cyan-400" />
                    </div>
                    <p className="text-gray-400 font-bold text-lg mb-2">Select a room to start chatting</p>
                    <p className="text-gray-500 text-sm">Connect with people around the world</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Rocket className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-gray-500">Join a room or create your own</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feed View */}
      {currentView === 'feed' && (
        <div className="max-w-2xl mx-auto p-4 relative z-10">
          <div className="mb-5">
            <button
              onClick={createFeedPost}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 border border-pink-500/30"
            >
              <Plus className="w-6 h-6" />
              Share Something Amazing
              <Sparkles className="w-5 h-5 animate-pulse" />
            </button>
          </div>

          <div className="space-y-4">
            {feedPosts.map(post => (
              <div key={post.id} className="bg-gray-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 border border-purple-500/30 hover:shadow-purple-500/20 transition-all relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl pointer-events-none"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <img src={post.userPhoto} alt={post.userName} className="w-12 h-12 rounded-full border-2 border-purple-400" />
                      <Award className="absolute -bottom-1 -right-1 w-5 h-5 text-yellow-400 bg-gray-800 rounded-full p-0.5" />
                    </div>
                    <div>
                      <div className="font-black text-gray-200 flex items-center gap-2">
                        {post.userName}
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {new Date(post.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 text-lg leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-6 text-gray-400">
                    <button
                      onClick={() => likePost(post.id, post.likes, 'feed')}
                      className="flex items-center gap-2 hover:text-pink-400 transition-all bg-gray-700/50 px-4 py-2 rounded-xl font-bold hover:bg-pink-500/20 group/btn"
                    >
                      <Heart className="w-5 h-5 group-hover/btn:fill-pink-400" />
                      <span>{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-400 transition-all bg-gray-700/50 px-4 py-2 rounded-xl font-bold hover:bg-blue-500/20">
                      <MessageSquare className="w-5 h-5" />
                      <span>{post.comments || 0}</span>
                    </button>
                    <button className="ml-auto p-2 hover:bg-gray-700 rounded-xl transition-all">
                      <Menu className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community View */}
      {currentView === 'community' && (
        <div className="max-w-4xl mx-auto p-4 relative z-10">
          <div className="mb-5">
            <button
              onClick={createCommunityPost}
              className="w-full bg-gradient-to-r from-pink-500 to-red-600 text-white py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 border border-red-500/30"
            >
              <Plus className="w-6 h-6" />
              Start a Discussion
              <Zap className="w-5 h-5 animate-pulse" />
            </button>
          </div>

          <div className="space-y-4">
            {communityPosts.map(post => (
              <div key={post.id} className="bg-gray-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 border border-pink-500/30 cursor-pointer hover:border-pink-400 hover:shadow-pink-500/20 transition-all group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent rounded-2xl pointer-events-none"></div>
                <div className="relative flex gap-5">
                  <div className="flex-shrink-0 text-center bg-gradient-to-br from-pink-900/50 to-red-900/50 rounded-2xl p-4 border border-pink-500/30 backdrop-blur-xl">
                    <div className="text-3xl font-black text-pink-400 flex items-center gap-1">
                      <TrendingUp className="w-6 h-6" />
                      {post.likes || 0}
                    </div>
                    <div className="text-xs text-gray-500 font-bold">votes</div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-gray-200 mb-2 text-xl flex items-center gap-2 group-hover:text-pink-400 transition-colors">
                      {post.title}
                      <Crown className="w-5 h-5 text-yellow-400" />
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-xl">
                        <img src={post.userPhoto} alt={post.userName} className="w-6 h-6 rounded-full border border-pink-400" />
                        <span className="font-bold">{post.userName}</span>
                        <Star className="w-3 h-3 text-yellow-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{post.views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.comments || 0} comments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
{expandedImage && (
  <div 
    className="fixed inset-0 bg-black/0 backdrop-blur-xl flex items-center justify-center z-50 p-4"
    onClick={() => setExpandedImage(null)}
  >
   
   <button
     className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 text-white p-3 rounded-full transition-all hover:scale-125 shadow-2xl shadow-red-500/50 z-10 group animate-pulse"
   >
     <X className="w-6 h-6 group-hover:animate-spin" />

    </button>
    <div 
      className="relative max-w-full max-h-screen"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-50 animate-pulse"></div>
      <img 
        src={expandedImage} 
        alt="Expanded" 
        className="relative rounded-2xl max-w-full max-h-[190vh] object-contain shadow-2xl border-4 border-cyan-400"
      />
    </div>
  </div>
)}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border-2 border-cyan-500/50 shadow-2xl relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 blur"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-cyan-400 flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Room Password
                  <Shield className="w-5 h-5 text-yellow-400" />
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setRoomPassword('');
                    setPendingRoom(null);
                  }}
                  className="text-gray-400 hover:text-red-400 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative mb-4">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-xl focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Join Room
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setRoomPassword('');
                    setPendingRoom(null);
                  }}
                  className="px-6 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawing Modal */}
      {showDrawing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border-2 border-purple-500/50 shadow-2xl relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-20 blur"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-purple-400 flex items-center gap-2">
                  <Palette className="w-6 h-6" />
                  Draw Something
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </h3>
                <button
                  onClick={() => setShowDrawing(false)}
                  className="text-gray-400 hover:text-red-400 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4 flex gap-2 flex-wrap">
                {['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#eab308', '#000000', '#ffffff'].map(color => (
                  <button
                    key={color}
                    onClick={() => setDrawColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${drawColor === color ? 'border-white scale-110 shadow-lg' : 'border-gray-600'}`}
                    style={{ backgroundColor: color }}
                  >
                    {drawColor === color && <div className="w-full h-full flex items-center justify-center"><Star className="w-5 h-5 text-white drop-shadow-lg" /></div>}
                  </button>
                ))}
              </div>
              
              <div className="relative mb-4 rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-2xl">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
  onTouchMove={draw}
  onTouchEnd={stopDrawing}
  className="w-full bg-white cursor-crosshair"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={sendDrawing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Drawing
                </button>
                <button
                  onClick={clearCanvas}
                  className="px-6 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 font-bold transition-all flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
{showQuizModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border-2 border-pink-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-red-600 rounded-2xl opacity-20 blur"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-pink-400 flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Create Quiz
            <Award className="w-5 h-5 text-yellow-400" />
          </h3>
          <button
            onClick={() => {
              setShowQuizModal(false);
              setQuizOptions(['', '', '', '']);
            }}
            className="text-gray-400 hover:text-red-400 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="quizQuestion"
              placeholder="Quiz question"
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-xl focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
            />
          </div>
          
          {quizOptions.map((opt, idx) => (
            <div key={idx} className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {String.fromCharCode(65 + idx)}
              </span>
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOptions = [...quizOptions];
                  newOptions[idx] = e.target.value;
                  setQuizOptions(newOptions);
                }}
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-xl focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
              />
            </div>
          ))}
          
          {quizOptions.length < 26 && (
            <button
              onClick={() => setQuizOptions([...quizOptions, ''])}
              className="w-full py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-600"
            >
              <Plus className="w-4 h-4" />
              Add Option (Max: Z)
            </button>
          )}
          
          <div className="relative">
            <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400" />
            <input
              type="text"
              id="correctAnswer"
              placeholder="Correct answer (A, B, C...)"
              maxLength="1"
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-xl focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all uppercase"
              onInput={(e) => e.target.value = e.target.value.toUpperCase()}
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              const question = document.getElementById('quizQuestion').value;
              const correct = document.getElementById('correctAnswer').value;
              const validOptions = quizOptions.filter(o => o.trim());
              
              if (!question || validOptions.length < 2 || !correct) {
                alert('❌ Please fill in the question, at least 2 options, and the correct answer!');
                return;
              }
              
              const answerIndex = correct.charCodeAt(0) - 65;
              if (answerIndex < 0 || answerIndex >= validOptions.length) {
                alert('❌ Correct answer must be a valid option letter!');
                return;
              }
              
              sendQuiz({ question, options: validOptions, correctAnswer: correct });
            }}
            className="flex-1 bg-gradient-to-r from-pink-500 to-red-600 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            Create Quiz
          </button>
          <button
            onClick={() => {
              setShowQuizModal(false);
              setQuizOptions(['', '', '', '']);
            }}
            className="px-6 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Random Picker Modal */}
{showRandomPicker && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border-2 border-green-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl opacity-20 blur"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-green-400 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Random Picker
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </h3>
          <button
            onClick={() => {
              setShowRandomPicker(false);
              setRandomOptions(['', '', '', '']);
              setRandomDelay(3);
            }}
            className="text-gray-400 hover:text-red-400 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 모드 선택 */}
        <div className="mb-4">
          <label className="text-sm font-bold text-gray-300 mb-2 block">Select Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRandomMode('race')}
              className={`p-3 rounded-xl font-bold transition-all ${
                randomMode === 'race'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🏁 Race
            </button>
            <button
              onClick={() => setRandomMode('beauty')}
              className={`p-3 rounded-xl font-bold transition-all ${
                randomMode === 'beauty'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              👑 Beauty
            </button>
            <button
              onClick={() => setRandomMode('lucky')}
              className={`p-3 rounded-xl font-bold transition-all ${
                randomMode === 'lucky'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🍀 Lucky
            </button>
            <button
              onClick={() => setRandomMode('dice')}
              className={`p-3 rounded-xl font-bold transition-all ${
                randomMode === 'dice'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎲 Dice
            </button>
          </div>
        </div>

        {randomMode !== 'dice' ? (
          <div className="space-y-3">
            {/* 제목 */}
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="randomTitle"
                placeholder="Title (optional)"
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              />
            </div>

            {/* 옵션들 */}
            {randomOptions.map((opt, idx) => (
              <div key={idx} className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...randomOptions];
                    newOptions[idx] = e.target.value;
                    setRandomOptions(newOptions);
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                />
              </div>
            ))}

            {randomOptions.length < 26 && (
              <button
                onClick={() => setRandomOptions([...randomOptions, ''])}
                className="w-full py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-600"
              >
                <Plus className="w-4 h-4" />
                Add Option (Max: Z)
              </button>
            )}

            {/* 공개 시간 */}
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={randomDelay}
                onChange={(e) => setRandomDelay(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-xl focus:border-green-500 focus:outline-none transition-all"
              >
                <option value={3}>Reveal after 3 seconds</option>
                <option value={5}>Reveal after 5 seconds</option>
                <option value={10}>Reveal after 10 seconds</option>
                <option value={15}>Reveal after 15 seconds</option>
                <option value={30}>Reveal after 30 seconds</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 주사위 모드 - 공개 시간만 */}
            <div className="bg-gray-700/50 p-6 rounded-xl text-center border border-gray-600">
              <div className="text-6xl mb-3">🎲</div>
              <p className="text-gray-300 font-bold">Roll the dice!</p>
              <p className="text-gray-400 text-sm mt-1">Result: 1-6</p>
            </div>

            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={randomDelay}
                onChange={(e) => setRandomDelay(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-xl focus:border-green-500 focus:outline-none transition-all"
              >
                <option value={3}>Reveal after 3 seconds</option>
                <option value={5}>Reveal after 5 seconds</option>
                <option value={10}>Reveal after 10 seconds</option>
                <option value={15}>Reveal after 15 seconds</option>
                <option value={30}>Reveal after 30 seconds</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              if (randomMode === 'dice') {
                sendRandomPicker({
                  mode: 'dice',
                  delay: randomDelay
                });
              } else {
                const title = document.getElementById('randomTitle')?.value || '';
                const validOptions = randomOptions.filter(o => o.trim());
                
                if (validOptions.length < 2) {
                  showToast('❌ Please add at least 2 options!', 'error');
                  return;
                }
                
                sendRandomPicker({
                  mode: randomMode,
                  title: title,
                  options: validOptions,
                  delay: randomDelay
                });
              }
            }}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            Start Random Picker
          </button>
          <button
            onClick={() => {
              setShowRandomPicker(false);
              setRandomOptions(['', '', '', '']);
              setRandomDelay(3);
            }}
            className="px-6 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Room Settings Modal */}
{showRoomSettings && selectedRoom && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border-2 border-yellow-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl opacity-20 blur"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-yellow-400 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Room Settings
            <Crown className="w-5 h-5" />
          </h3>
          <button
            onClick={() => setShowRoomSettings(false)}
            className="text-gray-400 hover:text-red-400 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 리더 관리 */}
          {isCreator(selectedRoom) && (
            <div className="bg-gray-700/50 p-4 rounded-xl border border-yellow-500/30">
              <h4 className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Leader Management
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
               {selectedRoom.members && Object.entries(selectedRoom.members).map(([memberId, member]) => {
  if (memberId === user.uid) return null;
  
  const isCurrentLeader = selectedRoom.leaders && selectedRoom.leaders[memberId];
  const isAssignedLeader = isCurrentLeader && isCurrentLeader.type === 'assigned';
  const isCreatorLeader = isCurrentLeader && isCurrentLeader.type === 'creator';
  
  return (
    <div key={memberId} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full border-2 border-cyan-400" />
        <div>
          <div className="font-bold text-white text-sm flex items-center gap-1">
            {member.name}
            {isCreatorLeader && (
              <Crown className="w-4 h-4 text-green-400" />
            )}
            {isAssignedLeader && (
              <Star className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            {member.online ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Online
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Offline
              </>
            )}
            {isCreatorLeader && (
              <span className="ml-1 text-green-400">• Creator</span>
            )}
            {isAssignedLeader && (
              <span className="ml-1 text-yellow-400">• Leader</span>
            )}
          </div>
        </div>
      </div>
      {!isCurrentLeader ? (
        <button
          onClick={() => assignLeader(selectedRoom.id, memberId, member.name, member.photo)}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:shadow-lg transition-all"
        >
          Assign Leader
        </button>
      ) : isAssignedLeader ? (
        <button
          onClick={() => removeLeader(selectedRoom.id, memberId)}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:shadow-lg transition-all"
        >
          Remove Leader
        </button>
      ) : (
        <span className="text-xs text-gray-500 bg-gray-700/50 px-3 py-1 rounded-lg">
          Creator
        </span>
      )}
    </div>
  );
})}
              </div>
            </div>
          )}

         

          

          {/* 규칙 관리 */}
          <div className="bg-gray-700/50 p-4 rounded-xl border border-yellow-500/30">
            <h4 className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Room Rules
            </h4>
            <div className="space-y-3">
              {selectedRoom.members && Object.entries(selectedRoom.members).map(([memberId, member]) => {
                if (memberId === user.uid) return null;
                
                // 리더인 사람은 규제 대상에서 제외
                const isTargetLeader = selectedRoom.leaders && selectedRoom.leaders[memberId];
                if (isTargetLeader) return null;
                
               const chatBlocked = selectedRoom.rules?.chat?.[memberId] === 'blocked';
const drawingBlocked = selectedRoom.rules?.drawing?.[memberId] === 'blocked';
const emojiBlocked = selectedRoom.rules?.emoji?.[memberId] === 'blocked';
const quizBlocked = selectedRoom.rules?.quiz?.[memberId] === 'blocked';
const randomBlocked = selectedRoom.rules?.random?.[memberId] === 'blocked';  // ← 추가

return (
  <div key={memberId} className="bg-gray-800/50 p-3 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <img src={member.photo} alt={member.name} className="w-6 h-6 rounded-full" />
      <span className="font-bold text-white text-sm">{member.name}</span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => setRoomRule(selectedRoom.id, 'chat', memberId, chatBlocked ? 'allowed' : 'blocked')}
        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
          chatBlocked 
            ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
            : 'bg-green-500/20 text-green-300 border border-green-500/50'
        }`}
      >
        💬 Chat: {chatBlocked ? 'Blocked' : 'Allowed'}
      </button>
      <button
        onClick={() => setRoomRule(selectedRoom.id, 'drawing', memberId, drawingBlocked ? 'allowed' : 'blocked')}
        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
          drawingBlocked 
            ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
            : 'bg-green-500/20 text-green-300 border border-green-500/50'
        }`}
      >
        🎨 Drawing: {drawingBlocked ? 'Blocked' : 'Allowed'}
      </button>
      <button
        onClick={() => setRoomRule(selectedRoom.id, 'emoji', memberId, emojiBlocked ? 'allowed' : 'blocked')}
        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
          emojiBlocked 
            ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
            : 'bg-green-500/20 text-green-300 border border-green-500/50'
        }`}
      >
        😀 Emoji: {emojiBlocked ? 'Blocked' : 'Allowed'}
      </button>
      <button
        onClick={() => setRoomRule(selectedRoom.id, 'quiz', memberId, quizBlocked ? 'allowed' : 'blocked')}
        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
          quizBlocked 
            ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
            : 'bg-green-500/20 text-green-300 border border-green-500/50'
        }`}
      >
        ❓ Quiz: {quizBlocked ? 'Blocked' : 'Allowed'}
      </button>
      <button
        onClick={() => setRoomRule(selectedRoom.id, 'random', memberId, randomBlocked ? 'allowed' : 'blocked')}
        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all col-span-2 ${
          randomBlocked 
            ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
            : 'bg-green-500/20 text-green-300 border border-green-500/50'
        }`}
      >
        🎲 Random: {randomBlocked ? 'Blocked' : 'Allowed'}
      </button>
    </div>
  </div>
);
              })}
            </div>
          </div>
        </div>

        {/* 금지어 관리 */}
<div className="bg-gray-700/50 p-4 rounded-xl border border-red-500/30">
  <h4 className="font-bold text-red-300 mb-3 flex items-center gap-2">
    <X className="w-5 h-5" />
    Banned Words
  </h4>
  
  {/* 금지어 추가 */}
  <div className="flex gap-2 mb-3">
    <input
      type="text"
      value={newBannedWord}
      onChange={(e) => setNewBannedWord(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          addBannedWord(selectedRoom.id, newBannedWord);
          setNewBannedWord('');
        }
      }}
      placeholder="Add banned word..."
      className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:border-red-500 focus:outline-none transition-all text-sm"
    />
    <button
      onClick={() => {
        addBannedWord(selectedRoom.id, newBannedWord);
        setNewBannedWord('');
      }}
      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
    >
      Add
    </button>
  </div>
  
  {/* 금지어 목록 */}
  <div className="space-y-2 max-h-32 overflow-y-auto">
    {selectedRoom.bannedWords && selectedRoom.bannedWords.length > 0 ? (
      selectedRoom.bannedWords.map((word, idx) => (
        <div key={idx} className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg">
          <span className="text-red-300 font-bold text-sm">{word}</span>
          <button
            onClick={() => removeBannedWord(selectedRoom.id, word)}
            className="text-red-400 hover:text-red-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))
    ) : (
      <div className="text-gray-400 text-sm text-center py-2">
        No banned words yet
      </div>
    )}
  </div>
</div>

        <button
          onClick={() => setShowRoomSettings(false)}
          className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-yellow-500/50 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  </div>
)}

 {/* User Settings Modal */}
{showUserSettings && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border-2 border-cyan-500/50 shadow-2xl relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-20 blur"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-cyan-400 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            User Settings
            <Star className="w-5 h-5 text-yellow-400" />
          </h3>
          <button
            onClick={() => {
              setShowUserSettings(false);
              setNewDisplayName('');
            }}
            className="text-gray-400 hover:text-red-400 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 현재 정보 */}
          <div className="bg-gray-700/50 p-4 rounded-xl border border-cyan-500/30">
            <h4 className="font-bold text-cyan-300 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Current Profile
            </h4>
            <div className="flex items-center gap-3">
              <img src={user.photo} alt={user.name} className="w-16 h-16 rounded-full border-2 border-cyan-400" />
              <div>
                <div className="font-bold text-white">{user.name}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            </div>
          </div>

          {/* 이름 변경 */}
          <div className="bg-gray-700/50 p-4 rounded-xl border border-cyan-500/30">
            <h4 className="font-bold text-cyan-300 mb-3 flex items-center gap-2">
              <AtSign className="w-5 h-5" />
              Change Display Name
            </h4>
            <div className="relative mb-3">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder={user.name}
                className="w-full pl-10 pr-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-xl focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={updateDisplayName}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Update Name
            </button>
          </div>

          {/* 추가 정보 */}
          <div className="bg-gray-700/50 p-4 rounded-xl border border-cyan-500/30">
            <div className="text-xs text-gray-400 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Your name will be updated across all rooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>Changes are synced with your Google account</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setShowUserSettings(false);
            setNewDisplayName('');
          }}
          className="w-full mt-4 bg-gray-700 text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-600 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        .animate-in {
          animation: fadeIn 0.2s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .slide-in-from-bottom-4 {
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(1rem);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Toast Notification */}
{toast && (
  <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4">
    <div className={`bg-gray-800/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border-2 ${
      toast.type === 'success' ? 'border-green-500/50' : 
      toast.type === 'error' ? 'border-red-500/50' : 
      'border-cyan-500/50'
    } max-w-sm`}>
      <div className="flex items-center gap-3">
        {toast.type === 'success' && <Award className="w-5 h-5 text-green-400" />}
        {toast.type === 'error' && <X className="w-5 h-5 text-red-400" />}
        {toast.type === 'info' && <Shield className="w-5 h-5 text-cyan-400" />}
        <span className="text-white font-bold">{toast.message}</span>
      </div>
    </div>
  </div>
)}
    </div>
  );
};


export default App;
