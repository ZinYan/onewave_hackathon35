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
  header: {
    alignSelf: "stretch",
    paddingLeft: 32,
    paddingRight: 32,
    paddingTop: 16,
    paddingBottom: 16,
    background: "rgba(255, 255, 255, 0.90)",
    borderBottom: "1px solid #D0FAE5",
    backdropFilter: "blur(4px)",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex"
  },
  headerLeft: {
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
    display: "flex"
  },
  logoIcon: {
    width: 40,
    height: 40,
    background: "linear-gradient(90deg, #00BC7D 0%, #00A6F4 100%)",
    boxShadow: "0px 2px 4px -2px rgba(0, 0, 0, 0.10), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)",
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    color: "white",
    fontSize: 18,
    fontWeight: "900"
  },
  logoText: {
    color: "#0F172B",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: "32px"
  },
  headerRight: {
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 24,
    display: "flex"
  },
  pointsBadge: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 6,
    paddingBottom: 6,
    background: "rgba(255, 255, 255, 0.80)",
    boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)",
    borderRadius: 16,
    border: "1px solid #FEF3C6",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    display: "flex"
  },
  pointsIcon: { color: "#FFB900", fontSize: 16 },
  pointsText: { color: "#0F172B", fontSize: 16, fontWeight: "600", lineHeight: "24px" },
  percentBadge: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    background: "white",
    boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)",
    borderRadius: 16,
    border: "1px solid #B8E6FE",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    display: "flex"
  },
  percentIcon: { color: "#0084D1", fontSize: 16 },
  percentText: { color: "#1D293D", fontSize: 16, fontWeight: "500", lineHeight: "24px" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    border: "2px solid #5EE9B5",
    overflow: "hidden",
    background: "#ccc"
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
  nodeInner: {
    borderRadius: 9999,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  nodeEmoji: {
    fontSize: 30,
    lineHeight: "36px"
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
  controlText: { color: "#1D293D", fontSize: 16, fontWeight: "500", lineHeight: "24px" }
};

// Node data with lucide icons
const nodes = [
  { id: 1, icon: Target, x: 25, y: 195, size: 50, bg: "linear-gradient(135deg, #10B981 0%, #059669 100%)", completed: true, title: "목표 설정", desc: "커리어 목표와 방향성을 설정하는 단계입니다." },
  { id: 2, icon: FileText, x: 175, y: 195, size: 50, bg: "linear-gradient(135deg, #34D399 0%, #10B981 100%)", completed: true, title: "자기 분석", desc: "나의 강점과 약점을 분석하고 개선점을 파악합니다." },
  { id: 3, icon: Briefcase, x: 310, y: 180, size: 90, bg: "linear-gradient(135deg, #00A6F4 0%, #00D492 50%, #615FFF 100%)", current: true, title: "역량 개발", desc: "직무에 필요한 핵심 역량을 개발하고 실전 경험을 쌓게 됩니다." },
  { id: 4, icon: Users, x: 485, y: 195, size: 50, bg: "linear-gradient(135deg, #DFF2FE 0%, #D0FAE5 100%)", locked: true, title: "네트워킹", desc: "업계 전문가들과 네트워크를 형성합니다." },
  { id: 5, icon: Mic, x: 635, y: 195, size: 50, bg: "linear-gradient(135deg, #DFF2FE 0%, #E0E7FF 100%)", locked: true, title: "면접 준비", desc: "실전 면접을 대비한 준비를 진행합니다." },
  { id: 6, icon: Rocket, x: 785, y: 195, size: 50, bg: "linear-gradient(135deg, #D0FAE5 0%, #E0E7FF 100%)", locked: true, title: "지원 및 도전", desc: "원하는 기업에 지원하고 도전합니다." },
  { id: 7, emoji: "🏆", x: 890, y: 165, size: 110, bg: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", locked: true, final: true, title: "목표 달성", desc: "축하합니다! 커리어 목표를 달성했습니다!" }
];

export default function Roadmap() {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(3);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [defaultPan, setDefaultPan] = useState({ x: 0, y: 0 });
  const progress = 42;
  const points = 1245;
  const streak = 12;

  // 컨테이너 크기에 따라 자동 가운데 정렬
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = 1000; // 노드들의 전체 너비 (25 ~ 1000)
      const centerX = (containerWidth - contentWidth) / 2;
      setDefaultPan({ x: centerX, y: 0 });
      setPan({ x: centerX, y: 0 });
    }
  }, []);

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
            <div style={styles.pathLine} />

          {/* Nodes */}
          {nodes.map((node) => {
            // 노드 타입별 스타일 결정
            const getNodeStyle = () => {
              if (node.completed) {
                // 완료된 노드: 초록 그라데이션 + 흰 테두리
                return {
                  background: node.bg,
                  border: "4px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 4px 20px rgba(0, 212, 146, 0.3)"
                };
              } else if (node.current) {
                // 현재 노드: 그라데이션 테두리 + 보라색 글로우
                return {
                  background: "linear-gradient(135deg, #5EE9B5, #00A6F4, #615FFF) padding-box, linear-gradient(135deg, #5EE9B5, #00A6F4, #615FFF) border-box",
                  border: "5px solid transparent",
                  boxShadow: "0 0 40px rgba(97, 95, 255, 0.6), 0 0 80px rgba(97, 95, 255, 0.3), inset 0 0 20px rgba(255,255,255,0.2)"
                };
              } else if (node.final) {
                // 최종 노드: 골드 테두리
                return {
                  background: "linear-gradient(145deg, #FFF8E7, #FFF5DB)",
                  border: "4px solid #6EE7B7",
                  boxShadow: "0 4px 20px rgba(110, 231, 183, 0.3)"
                };
              } else {
                // 잠긴 노드: 민트색 테두리 + 연한 내부
                return {
                  background: "linear-gradient(145deg, #F8FDFC, #F0FDF9)",
                  border: "3px solid #6EE7B7",
                  boxShadow: "0 4px 15px rgba(110, 231, 183, 0.2)"
                };
              }
            };

            const nodeStyle = getNodeStyle();

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
                {node.final ? (
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



              {/* Detail Card - 선택된 노드 아래에 표시 (y축 고정) */}
              {selectedNode === node.id && (
                <div style={{ 
                  ...styles.detailCard, 
                  left: node.x + (node.size || 70) / 2 - 120,
                  top: 300
                }}>
                  <div style={styles.detailTitle}>{node.title}</div>
                  <div style={styles.detailContent}>{node.desc}</div>
                </div>
              )}
            </div>
          )})}
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
