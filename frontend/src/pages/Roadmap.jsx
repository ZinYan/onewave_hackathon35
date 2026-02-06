import { useState, useRef, useEffect } from "react";
import Header2 from "../components/Header2";
import { Target, FileText, Briefcase, Users, Mic, Rocket, Trophy, Lock } from "lucide-react";

// Styles
const styles = {
  page: {
    width: "100%",
    height: "calc(100vh - 20px)",
    overflow: "hidden",
    background: "linear-gradient(180deg, #FFFFFF 0%, #F0FDF9 50%, #E0F7FA 100%)",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    display: "flex",
    fontFamily: "Pretendard, system-ui, -apple-system, sans-serif"
  },
  content: {
    alignSelf: "stretch",
    flex: 1,
    paddingLeft: 32,
    paddingRight: 32,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 16,
    display: "flex",
    overflow: "hidden"
  },
  progressSection: {
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 8,
    display: "flex"
  },
  progressHeader: {
    alignSelf: "stretch",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex"
  },
  progressLabel: { color: "#1D293D", fontSize: 18, fontWeight: "600", lineHeight: "28px" },
  progressPercent: { color: "#0F172B", fontSize: 16, fontWeight: "700", lineHeight: "24px" },
  progressBar: {
    alignSelf: "stretch",
    height: 16,
    position: "relative",
    background: "#D0FAE5",
    borderRadius: 9999,
    overflow: "hidden"
  },
  progressFill: {
    height: 16,
    background: "linear-gradient(90deg, #00D492 0%, #00A6F4 50%, #615FFF 100%)",
    boxShadow: "0px 0px 10px rgba(56, 189, 248, 0.60)",
    borderRadius: 9999
  },
  streakBadge: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
    boxShadow: "0px 2px 8px rgba(255, 105, 0, 0.15)",
    borderRadius: 20,
    border: "1px solid #ffffff",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    display: "flex"
  },
  streakIcon: { color: "#FF6900", fontSize: 24 },
  streakText: { color: "#4B4B4B", fontSize: 20, fontWeight: "600", lineHeight: "28px" },
  roadmapArea: {
    alignSelf: "stretch",
    flex: 1,
    position: "relative",
    overflow: "hidden"
  },
  pathLine: {
    position: "absolute",
    top: 220,
    left: 50,
    width: 950,
    height: 8,
    background: "transparent",
    borderTop: "8px dashed #BAE6FD"
  },
  nodeBase: {
    position: "absolute",
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.3s"
  },
  nodeBadge: {
    position: "absolute",
    background: "#00A6F4",
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    color: "white",
    fontSize: 12,
    fontWeight: "900",
    boxShadow: "0px 2px 4px -2px rgba(0, 0, 0, 0.10), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)"
  },
  detailCard: {
    position: "absolute",
    width: 240,
    padding: 20,
    background: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0px 4px 6px -4px rgba(0, 0, 0, 0.10), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)",
    borderRadius: 16,
    border: "1px solid #DFF2FE",
    backdropFilter: "blur(4px)"
  },
  detailTitle: { color: "#314158", fontSize: 14, fontWeight: "500", lineHeight: "20px", marginBottom: 8 },
  detailContent: { color: "#6B7280", fontSize: 13, lineHeight: "20px" },
  controls: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 12
  },
  controlBtn: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 12,
    paddingBottom: 12,
    background: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0px 4px 6px -4px rgba(0, 0, 0, 0.10), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)",
    borderRadius: 16,
    border: "1px solid #B8E6FE",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    display: "flex",
    cursor: "pointer"
  },
  controlBtnGreen: {
    border: "1px solid #A4F4CF"
  },
  controlIcon: { fontSize: 16, fontWeight: "900" },
  controlText: { color: "#1D293D", fontSize: 16, fontWeight: "500", lineHeight: "24px" },
  loading: {
    textAlign: "center",
    color: "#6A7282",
    fontSize: 18,
    padding: "40px 0"
  },
  error: {
    textAlign: "center",
    color: "#DC2626",
    fontSize: 16,
    padding: "40px 0"
  }
};

// 아이콘 매핑
const iconMap = {
  Target,
  FileText,
  Briefcase,
  Users,
  Mic,
  Rocket,
  Trophy
};

export default function Roadmap() {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [defaultPan, setDefaultPan] = useState({ x: 0, y: 0 });
  
  // API 데이터 상태
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [progress, setProgress] = useState(0);
  const [streak, setStreak] = useState(0);

  // API에서 로드맵 데이터 가져오기
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/roadmap/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch roadmap');
        }

        const data = await response.json();
        setRoadmapData(data);

        // metrics에서 진행률 설정
        if (data.metrics) {
          setProgress(Math.round(data.metrics.completion_rate || 0));
        }

        // items를 노드로 변환
        if (data.items && data.items.length > 0) {
          const convertedNodes = data.items.map((item, index) => {
            const nodeSize = item.priority === 1 ? 90 : 50; // 우선순위 1번은 크게
            const xPosition = 25 + (index * 150); // 노드 간격
            const yPosition = item.priority === 1 ? 180 : 195; // 우선순위 1번은 살짝 위로
            
            // 상태에 따라 노드 스타일 결정
            const isCompleted = item.status === 'completed';
            const isCurrent = item.status === 'in_progress';
            const isLocked = item.status === 'pending';
            const isFinal = index === data.items.length - 1;

            // 배경 그라데이션 설정
            let background;
            if (isCompleted) {
              background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
            } else if (isCurrent) {
              background = "linear-gradient(135deg, #00A6F4 0%, #00D492 50%, #615FFF 100%)";
            } else if (isFinal) {
              background = "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)";
            } else {
              background = "linear-gradient(135deg, #DFF2FE 0%, #D0FAE5 100%)";
            }

            return {
              id: item.id,
              icon: iconMap[item.icon] || Briefcase, // 백엔드에서 아이콘 이름 제공
              emoji: isFinal ? "🏆" : null,
              x: xPosition,
              y: yPosition,
              size: nodeSize,
              bg: background,
              completed: isCompleted,
              current: isCurrent,
              locked: isLocked,
              final: isFinal,
              title: item.title,
              desc: item.description || `${item.duration_weeks}주 소요 예상`,
              priority: item.priority,
              importanceScore: item.importance_score
            };
          });

          setNodes(convertedNodes);
          
          // 현재 진행 중인 노드를 자동 선택
          const currentNode = convertedNodes.find(n => n.current);
          if (currentNode) {
            setSelectedNode(currentNode.id);
          }
        }

        // 연속 일수 계산 (최신 저널 기준 - 예시)
        setStreak(12); // TODO: 실제 API에서 연속 일수 제공 시 수정

      } catch (err) {
        console.error('Error fetching roadmap:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, []);

  // 컨테이너 크기에 따라 자동 가운데 정렬
  useEffect(() => {
    if (containerRef.current && nodes.length > 0) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = nodes[nodes.length - 1]?.x + 100 || 1000;
      const centerX = (containerWidth - contentWidth) / 2;
      setDefaultPan({ x: centerX, y: 0 });
      setPan({ x: centerX, y: 0 });
    }
  }, [nodes]);

  // 줌 핸들러
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 2));
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => {
    setZoom(1);
    setPan(defaultPan);
  };

  // 패닝 핸들러
  const handleMouseDown = (e) => {
    if (e.target.closest('[data-clickable]')) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  // 노드 스타일 결정 함수
  const getNodeStyle = (node) => {
    if (node.completed) {
      return {
        background: node.bg,
        border: "4px solid rgba(255,255,255,0.8)",
        boxShadow: "0 4px 20px rgba(0, 212, 146, 0.3)"
      };
    } else if (node.current) {
      return {
        background: "linear-gradient(135deg, #5EE9B5, #00A6F4, #615FFF) padding-box, linear-gradient(135deg, #5EE9B5, #00A6F4, #615FFF) border-box",
        border: "5px solid transparent",
        boxShadow: "0 0 40px rgba(97, 95, 255, 0.6), 0 0 80px rgba(97, 95, 255, 0.3), inset 0 0 20px rgba(255,255,255,0.2)"
      };
    } else if (node.final) {
      return {
        background: "linear-gradient(145deg, #FFF8E7, #FFF5DB)",
        border: "4px solid #6EE7B7",
        boxShadow: "0 4px 20px rgba(110, 231, 183, 0.3)"
      };
    } else {
      return {
        background: "linear-gradient(145deg, #F8FDFC, #F0FDF9)",
        border: "3px solid #6EE7B7",
        boxShadow: "0 4px 15px rgba(110, 231, 183, 0.2)"
      };
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div style={styles.page}>
        <Header2 />
        <div style={styles.content}>
          <div style={styles.loading}>로드맵을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div style={styles.page}>
        <Header2 />
        <div style={styles.content}>
          <div style={styles.error}>
            로드맵을 불러오는데 실패했습니다.
            <br />
            <button 
              style={{ ...styles.controlBtn, marginTop: 20 }}
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <Header2 />

      {/* Content */}
      <div style={styles.content}>
        {/* Progress Section */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>목표 실행도</span>
            <span style={styles.progressPercent}>{progress}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
        </div>

        {/* Streak Badge */}
        <div style={styles.streakBadge}>
          <span style={styles.streakIcon}>🔥</span>
          <span style={styles.streakText}>{streak}일째</span>
        </div>

        {/* Roadmap Area */}
        <div 
          ref={containerRef}
          style={{
            ...styles.roadmapArea,
            cursor: isPanning ? "grabbing" : "grab"
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Zoomable & Pannable content */}
          <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.2s ease-out",
            position: "relative",
            width: "100%",
            height: "100%"
          }}>
            {/* Path Line */}
            {nodes.length > 0 && (
              <div style={{
                ...styles.pathLine,
                width: nodes[nodes.length - 1]?.x - 25 || 950
              }} />
            )}

            {/* Nodes */}
            {nodes.map((node) => {
              const nodeStyle = getNodeStyle(node);

              return (
                <div key={node.id}>
                  <div
                    data-clickable
                    style={{
                      ...styles.nodeBase,
                      left: node.x,
                      top: node.y,
                      width: node.size || 70,
                      height: node.size || 70,
                      ...nodeStyle,
                      opacity: node.locked && !node.final ? 0.95 : 1
                    }}
                    onClick={() => setSelectedNode(prev => prev === node.id ? null : node.id)}
                  >
                    {node.final && node.emoji ? (
                      <span style={{ fontSize: 56 }}>{node.emoji}</span>
                    ) : (
                      <node.icon 
                        size={node.current ? 40 : 24}
                        strokeWidth={node.current ? 2.5 : 2}
                        color={node.completed ? "#fff" : (node.current ? "#fff" : (node.locked ? "#64748B" : "#fff"))}
                        style={{
                          filter: node.locked && !node.final ? "opacity(0.7)" : "none"
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Lock badge for locked nodes */}
                  {node.locked && (
                    <div style={{ 
                      ...styles.nodeBadge, 
                      left: node.x + (node.size || 70) - (node.final ? 20 : 16), 
                      top: node.y - (node.final ? 4 : 8), 
                      width: node.final ? 34 : 28, 
                      height: node.final ? 34 : 28,
                      background: node.final ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" : "#00A6F4"
                    }}>
                      <Lock size={node.final ? 18 : 14} color="#fff" strokeWidth={2.5} />
                    </div>
                  )}

                  {/* Detail Card - 선택된 노드 아래에 표시 */}
                  {selectedNode === node.id && (
                    <div style={{ 
                      ...styles.detailCard, 
                      left: node.x + (node.size || 70) / 2 - 120,
                      top: 300
                    }}>
                      <div style={styles.detailTitle}>{node.title}</div>
                      <div style={styles.detailContent}>{node.desc}</div>
                      {node.importanceScore && (
                        <div style={{ ...styles.detailContent, marginTop: 8, color: "#00A6F4", fontWeight: "600" }}>
                          중요도: {node.importanceScore}/100
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Controls - 줌 영역 밖에 위치 */}
          <div style={styles.controls}>
            <div style={styles.controlBtn} onClick={zoomOut}>
              <span style={{ ...styles.controlIcon, color: "#0069A8" }}>−</span>
              <span style={styles.controlText}>축소</span>
            </div>
            <div style={{ ...styles.controlBtn, ...styles.controlBtnGreen }} onClick={resetZoom}>
              <span style={{ ...styles.controlIcon, color: "#007A55" }}>↻</span>
              <span style={styles.controlText}>초기화</span>
            </div>
            <div style={styles.controlBtn} onClick={zoomIn}>
              <span style={{ ...styles.controlIcon, color: "#0069A8" }}>+</span>
              <span style={styles.controlText}>확대</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}