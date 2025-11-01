import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Globe, Users, Plus, Lock, Send, Heart, MessageSquare, LogOut, Sparkles, Zap, Smile, Palette, HelpCircle, X, Search, Bell, Settings, Menu, TrendingUp, Star, Award, Shield, Crown, Rocket, Image as ImageIcon, ChevronUp, ZoomIn, ChevronDown, Filter, Hash, AtSign } from 'lucide-react';


const App = () => {
  const [currentView, setCurrentView] = useState('chat');
  const [toast, setToast] = useState(null);
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

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '😎', '🤔', '😍', '🚀', '⭐', '💪', '🎮', '🎨'];

  useEffect(() => {
    initFirebase();




    
    const checkFirebase = setInterval(() => {
      if (window.firebase) {
        clearInterval(checkFirebase);
        
        const firebaseConfig = {
          apiKey: "AIzaSyB2I_bmwVhb-0RO8ljvunDSa3K-TCSzt2E",
          authDomain: "unvul-chat.firebaseapp.com",
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

      return () => messagesRef.off();
    }
  }, [selectedRoom, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        type: 'creator', // creator or assigned
        name: user.name,
        photo: user.photo,
        assignedAt: Date.now()
      }
    },
    members: {}, // 방에 참여한 적 있는 모든 멤버
    rules: {
      chat: {}, // { userId: blocked/allowed }
      drawing: {},
      emoji: {},
      quiz: {},
      // 추후 추가될 기능들
    }
  });
  setShowCreateRoom(false);
};

const joinRoom = (room) => {
  if (room.hasPassword) {
    setPendingRoom(room);
    setShowPasswordModal(true);
  } else {
    // 실시간 리스너 추가
    const roomRef = window.firebase.database().ref(`rooms/${room.id}`);
    roomRef.on('value', (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        setSelectedRoom({
          id: room.id,
          ...roomData
        });
      }
    });
    registerMember(room.id);
  }
};

const registerMember = (roomId) => {
  const memberRef = window.firebase.database().ref(`rooms/${roomId}/members/${user.uid}`);
  memberRef.set({
    name: user.name,
    photo: user.photo,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
    online: true
  });
  
  // 온라인 상태 업데이트
  const onlineRef = window.firebase.database().ref(`rooms/${roomId}/members/${user.uid}/online`);
  onlineRef.onDisconnect().set(false);
};

const handlePasswordSubmit = () => {
  if (pendingRoom && roomPassword === pendingRoom.password) {
    // 실시간 리스너 추가
    const roomRef = window.firebase.database().ref(`rooms/${pendingRoom.id}`);
    roomRef.on('value', (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        setSelectedRoom({
          id: pendingRoom.id,
          ...roomData
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

const assignLeader = (roomId, targetUserId, targetUserName, targetUserPhoto) => {
  const leadersRef = window.firebase.database().ref(`rooms/${roomId}/leaders/${targetUserId}`);
  leadersRef.set({
    type: 'assigned',
    name: targetUserName,
    photo: targetUserPhoto,
    assignedBy: user.uid,
    assignedAt: Date.now()
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
  leaderRef.remove();
  
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
  setToast({ message, type });
  setTimeout(() => setToast(null), 3000);
};

const setRoomRule = (roomId, feature, targetUserId, action) => {
  const ruleRef = window.firebase.database().ref(`rooms/${roomId}/rules/${feature}/${targetUserId}`);
  ruleRef.set(action);
  
  // 규칙 변경 메시지 전송
  const messagesRef = window.firebase.database().ref(`rooms/${roomId}/messages`);
  const targetMember = selectedRoom.members[targetUserId];
  
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
};

const checkPermission = (room, feature) => {
  if (!room || !room.rules) return true;
  
  const userRule = room.rules[feature] && room.rules[feature][user.uid];
  if (userRule === 'blocked') {
    return false;
  }
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

  const messagesRef = window.firebase.database().ref(`rooms/${selectedRoom.id}/messages`);
  messagesRef.push({
    text: newMessage,
    userId: user.uid,
    userName: user.name,
    userPhoto: user.photo,
    timestamp: Date.now()
  });

  setNewMessage('');
};

const sendDrawing = () => {
  if (!canvasRef.current || !selectedRoom) return;
  
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

const startDrawing = (e) => {
  setIsDrawing(true);
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
};

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
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
      <header className="bg-gray-800/90 backdrop-blur-2xl border-b border-cyan-500/30 sticky top-0 z-50 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-gradient-to-br from-cyan-500 to-purple-600 p-2.5 rounded-2xl">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                Unvul Chat
                <Crown className="w-5 h-5 text-yellow-400" />
              </h1>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-gray-400 font-medium">Made By Unvul® Ver 2.0</span>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 bg-gray-700/50 rounded-2xl p-1.5 border border-cyan-500/30 backdrop-blur-xl">
            <button
              onClick={() => setCurrentView('chat')}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold ${
                currentView === 'chat' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50' 
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              onClick={() => setCurrentView('feed')}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold ${
                currentView === 'feed' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50' 
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="hidden sm:inline">Feed</span>
            </button>
            <button
              onClick={() => setCurrentView('community')}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold ${
                currentView === 'community' 
                  ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg shadow-pink-500/50' 
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Community</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button className="relative text-gray-400 hover:text-cyan-400 p-2 rounded-xl hover:bg-gray-700/50 transition-all">
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-gray-400 hover:text-cyan-400 p-2 rounded-xl hover:bg-gray-700/50 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <button className="text-gray-400 hover:text-cyan-400 p-2 rounded-xl hover:bg-gray-700/50 transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-75 transition"></div>
              <img src={user.photo} alt={user.name} className="relative w-11 h-11 rounded-full border-2 border-cyan-400 shadow-lg" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 hover:bg-gray-700/50 p-2.5 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat View */}
      {currentView === 'chat' && (
        <div className="max-w-7xl mx-auto p-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
            {/* Rooms List */}
            <div className="bg-gray-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 overflow-y-auto border border-cyan-500/30 relative">
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

            {/* Chat Area */}
            <div className="md:col-span-2 bg-gray-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col border border-cyan-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl pointer-events-none"></div>
              
              {selectedRoom ? (
                <>
                  <div className="p-5 border-b border-gray-700 bg-gray-700/50 backdrop-blur-xl relative z-10">
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
                            {selectedRoom.participants || 0} members online
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
  <button className="p-2 hover:bg-gray-600 rounded-xl transition-all text-gray-400 hover:text-cyan-400">
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

                  <div className="flex-1 overflow-y-auto p-5 space-y-4 relative">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex gap-3 ${msg.userId === user.uid ? 'flex-row-reverse' : ''} group`}>
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
      <div className={`p-4 rounded-2xl shadow-lg relative ${
        msg.userId === user.uid
          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
          : 'bg-gray-700 text-gray-200 border border-gray-600'
      }`}>
        {msg.text}
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

                  <div className="p-5 border-t border-gray-700 bg-gray-700/50 backdrop-blur-xl relative z-10">
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
                      <button className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition"></div>
                        <div className="relative bg-gray-600 p-2 rounded-lg hover:bg-blue-600 transition-all">
                          <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                      </button>
                      <button className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition"></div>
                        <div className="relative bg-gray-600 p-2 rounded-lg hover:bg-green-600 transition-all">
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
                  const isAssignedLeader = isCurrentLeader?.type === 'assigned';
                  
                  return (
                    <div key={memberId} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full border-2 border-cyan-400" />
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1">
                            {member.name}
                            {isCurrentLeader?.type === 'creator' && (
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
                            {isCurrentLeader && (
                              <span className="ml-1 text-yellow-400">
                                • {isCurrentLeader.type === 'creator' ? 'Creator' : 'Leader'}
                              </span>
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
                          Remove
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
                    </div>
                  </div>
                );
              })}
            </div>
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
    </div>
  );
};


export default App;