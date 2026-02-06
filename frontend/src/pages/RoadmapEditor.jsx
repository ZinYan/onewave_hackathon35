import { useState } from "react";
import { Plus, Trash2, GripVertical, ListTodo, Circle, CheckCircle, X, Bot, User } from "lucide-react";

// Styles
const styles = {
  page: {
    width: "100%",
    height: "100vh",
    background: "white",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    display: "flex",
    fontFamily: "Pretendard, system-ui, -apple-system, sans-serif"
  },
  // Header
  header: {
    alignSelf: "stretch",
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 16,
    paddingBottom: 16,
    background: "linear-gradient(90deg, #EEF2FF 0%, white 100%)",
    borderBottom: "1px solid #C6D2FF",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex"
  },
  headerLeft: {
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    display: "flex"
  },
  headerTitle: {
    color: "#312C85",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: "28px"
  },
  editBadge: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 4,
    paddingBottom: 4,
    background: "#E0E7FF",
    borderRadius: 9999,
    border: "1px solid #A3B3FF",
    color: "#432DD7",
    fontSize: 12,
    fontWeight: "500"
  },
  headerRight: {
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
    display: "flex"
  },
  btnOutline: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    background: "#EEF2FF",
    borderRadius: 8,
    border: "1px solid #A3B3FF",
    color: "#432DD7",
    fontSize: 14,
    fontWeight: "500",
    cursor: "pointer"
  },
  btnOutlineWhite: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    background: "white",
    borderRadius: 8,
    border: "1px solid #A3B3FF",
    color: "#432DD7",
    fontSize: 14,
    fontWeight: "500",
    cursor: "pointer"
  },
  btnPrimary: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    background: "linear-gradient(90deg, #4F39F6 0%, #9810FA 100%)",
    borderRadius: 8,
    border: "1px solid #432DD7",
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    cursor: "pointer"
  },
  avatarBtn: {
    width: 32,
    height: 32,
    background: "linear-gradient(135deg, #E0E7FF 0%, #F3E8FF 100%)",
    borderRadius: 9999,
    border: "1px solid #A3B3FF",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    cursor: "pointer"
  },
  // Main Content
  mainContent: {
    alignSelf: "stretch",
    flex: 1,
    overflow: "hidden",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    display: "flex"
  },
  // Left Panel
  leftPanel: {
    width: 300,
    height: "100%",
    background: "linear-gradient(180deg, rgba(238, 242, 255, 0.5) 0%, white 100%)",
    borderRight: "1px solid #E0E7FF",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    display: "flex"
  },
  leftPanelHeader: {
    width: "100%",
    padding: 16,
    borderBottom: "1px solid #E0E7FF",
    flexDirection: "column",
    gap: 12,
    display: "flex"
  },
  sectionTitle: {
    color: "#312C85",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: "28px"
  },
  addStepBtn: {
    width: "100%",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    background: "linear-gradient(90deg, #615FFF 0%, #AD46FF 100%)",
    borderRadius: 8,
    border: "1px solid #4F39F6",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    display: "flex",
    cursor: "pointer",
    color: "white",
    fontSize: 14,
    fontWeight: "500"
  },
  stepsList: {
    flex: 1,
    width: "100%",
    padding: 16,
    overflow: "auto",
    flexDirection: "column",
    gap: 12,
    display: "flex"
  },
  stepCard: {
    padding: 16,
    boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)",
    overflow: "hidden",
    borderRadius: 8,
    flexDirection: "column",
    gap: 12,
    display: "flex",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s"
  },
  stepCardBlue: {
    background: "linear-gradient(169deg, #EFF6FF 0%, white 100%)",
    border: "1px solid #BEDBFF"
  },
  stepCardGreen: {
    background: "linear-gradient(172deg, #ECFDF5 0%, white 100%)",
    border: "2px solid #00D492"
  },
  stepCardYellow: {
    background: "linear-gradient(172deg, #FFFBEB 0%, white 100%)",
    border: "1px solid #FEE685"
  },
  stepCardPurple: {
    background: "linear-gradient(172deg, #FAF5FF 0%, white 100%)",
    border: "1px solid #E9D4FF"
  },
  stepCardHeader: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex"
  },
  stepCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: "24px"
  },
  stepCardDesc: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: "20px"
  },
  stepCardFooter: {
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    display: "flex"
  },
  taskCount: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: "16px"
  },
  deleteBtn: {
    width: "100%",
    padding: 16,
    borderTop: "1px solid #E0E7FF"
  },
  deleteBtnInner: {
    width: "100%",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    background: "#FFF1F2",
    borderRadius: 8,
    border: "1px solid #FFA1AD",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    display: "flex",
    cursor: "pointer",
    color: "#C70036",
    fontSize: 14,
    fontWeight: "500"
  },
  // Center Canvas
  centerPanel: {
    flex: 1,
    height: "100%",
    padding: 16,
    background: "linear-gradient(121deg, rgba(238, 242, 255, 0.3) 0%, #F3F4F6 100%)",
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    display: "flex",
    position: "relative"
  },
  canvas: {
    width: "100%",
    height: "100%",
    position: "relative",
    background: "white",
    borderRadius: 12,
    border: "1px solid #E0E7FF",
    overflow: "hidden"
  },
  canvasHint: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    padding: 16,
    background: "linear-gradient(90deg, #EEF2FF 0%, white 100%)",
    boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)",
    borderRadius: 8,
    border: "1px solid #C6D2FF",
    color: "#372AAC",
    fontSize: 14,
    fontWeight: "400"
  },
  // Canvas Node
  canvasNode: {
    position: "absolute",
    width: 240,
    padding: 14,
    boxShadow: "0px 4px 6px -4px rgba(0, 0, 0, 0.10), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)",
    overflow: "hidden",
    borderRadius: 12,
    flexDirection: "column",
    gap: 10,
    display: "flex",
    cursor: "grab"
  },
  nodeBlue: {
    background: "linear-gradient(136deg, #EFF6FF 0%, white 100%)",
    border: "2px solid #8EC5FF"
  },
  nodeGreen: {
    background: "linear-gradient(140deg, #ECFDF5 0%, white 100%)",
    border: "4px solid #00D492",
    boxShadow: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)"
  },
  nodeYellow: {
    background: "linear-gradient(147deg, #FFFBEB 0%, white 100%)",
    border: "2px solid #FFD230"
  },
  nodePurple: {
    background: "linear-gradient(141deg, #FAF5FF 0%, white 100%)",
    border: "2px solid #DAB2FF"
  },
  nodeHeader: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex"
  },
  nodeTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: "24px"
  },
  nodeDesc: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: "20px"
  },
  nodeTasks: {
    paddingTop: 12,
    flexDirection: "column",
    gap: 8,
    display: "flex"
  },
  nodeTask: {
    padding: 8,
    borderRadius: 4,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    display: "flex"
  },
  // Right Panel
  rightPanel: {
    width: 320,
    height: "100%",
    background: "white",
    borderLeft: "1px solid #E0E7FF",
    flexDirection: "column",
    display: "flex"
  },
  aiSection: {
    padding: 20,
    background: "linear-gradient(90deg, rgba(238, 242, 255, 0.5) 0%, white 100%)",
    borderBottom: "1px solid #E0E7FF",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
    display: "flex"
  },
  aiAvatar: {
    width: 40,
    height: 40,
    background: "linear-gradient(135deg, #615FFF 0%, #AD46FF 100%)",
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
    display: "flex"
  },
  aiTitle: {
    color: "#312C85",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: "28px"
  },
  aiSubtitle: {
    color: "#432DD7",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: "20px"
  },
  propertiesHeader: {
    padding: 24,
    background: "linear-gradient(90deg, rgba(238, 242, 255, 0.5) 0%, white 100%)",
    borderBottom: "1px solid #E0E7FF",
    flexDirection: "column",
    gap: 4,
    display: "flex"
  },
  propertiesTitle: {
    color: "#312C85",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: "28px"
  },
  propertiesSubtitle: {
    color: "#432DD7",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: "20px"
  },
  propertiesContent: {
    flex: 1,
    padding: 24,
    overflow: "auto",
    flexDirection: "column",
    gap: 24,
    display: "flex"
  },
  formGroup: {
    flexDirection: "column",
    gap: 8,
    display: "flex"
  },
  formLabel: {
    color: "#312C85",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: "20px"
  },
  formInput: {
    padding: "12px 16px",
    background: "white",
    borderRadius: 8,
    border: "1px solid #A3B3FF",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: "24px",
    outline: "none"
  },
  formTextarea: {
    padding: "12px 16px",
    background: "white",
    borderRadius: 8,
    border: "1px solid #A3B3FF",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: "24px",
    outline: "none",
    resize: "none",
    height: 128
  },
  tasksHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex"
  },
  addTaskBtn: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 4,
    paddingBottom: 4,
    background: "linear-gradient(90deg, #615FFF 0%, #AD46FF 100%)",
    borderRadius: 8,
    border: "1px solid #4F39F6",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    display: "flex",
    cursor: "pointer",
    color: "white",
    fontSize: 14,
    fontWeight: "500"
  },
  taskItem: {
    position: "relative",
    padding: "13px 16px",
    background: "rgba(236, 253, 245, 0.3)",
    borderRadius: 8,
    border: "1px solid #A4F4CF",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex"
  },
  taskItemLeft: {
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    display: "flex"
  },
  taskItemText: {
    color: "#004F3B",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: "20px"
  }
};

// Color themes for steps
const colorThemes = {
  blue: {
    card: styles.stepCardBlue,
    node: styles.nodeBlue,
    titleColor: "#1C398E",
    descColor: "#1447E6",
    taskColor: "#193CB8",
    iconColor: "#155DFC",
    borderColor: "#BEDBFF"
  },
  green: {
    card: styles.stepCardGreen,
    node: styles.nodeGreen,
    titleColor: "#004F3B",
    descColor: "#007A55",
    taskColor: "#006045",
    iconColor: "#009966",
    borderColor: "#A4F4CF"
  },
  yellow: {
    card: styles.stepCardYellow,
    node: styles.nodeYellow,
    titleColor: "#7B3306",
    descColor: "#BB4D00",
    taskColor: "#973C00",
    iconColor: "#E17100",
    borderColor: "#FEE685"
  },
  purple: {
    card: styles.stepCardPurple,
    node: styles.nodePurple,
    titleColor: "#59168B",
    descColor: "#8200DB",
    taskColor: "#6E11B0",
    iconColor: "#9810FA",
    borderColor: "#E9D4FF"
  }
};

// Sample data
const initialSteps = [
  {
    id: 1,
    title: "Foundation Skills",
    description: "Learn basics of programming and tools",
    tasks: ["Learn Python syntax", "Version control with Git", "Basic data structures"],
    theme: "blue",
    position: { x: 20, y: 20 }
  },
  {
    id: 2,
    title: "Portfolio Projects",
    description: "Build real-world applications",
    tasks: ["Personal website", "API integration project", "Database design"],
    theme: "green",
    position: { x: 20, y: 280 }
  },
  {
    id: 3,
    title: "Job Search Prep",
    description: "Resume, interviews, networking",
    tasks: ["Polish LinkedIn profile", "Practice behavioral questions"],
    theme: "yellow",
    position: { x: 300, y: 280 }
  },
  {
    id: 4,
    title: "First Role & Growth",
    description: "Onboarding and skill advancement",
    tasks: ["Master team codebase", "Learn advanced system design"],
    theme: "purple",
    position: { x: 300, y: 20 }
  }
];

export default function RoadmapEditor() {
  const [steps, setSteps] = useState(initialSteps);
  const [selectedStep, setSelectedStep] = useState(steps[1]); // Portfolio Projects selected
  const [editMode, setEditMode] = useState(true);

  const handleStepClick = (step) => {
    setSelectedStep(step);
  };

  const handleAddStep = () => {
    const themes = ["blue", "green", "yellow", "purple"];
    const newStep = {
      id: Date.now(),
      title: "New Step",
      description: "Add description...",
      tasks: [],
      theme: themes[steps.length % 4],
      position: { x: 100 + (steps.length * 50), y: 100 + (steps.length * 30) }
    };
    setSteps([...steps, newStep]);
    setSelectedStep(newStep);
  };

  const handleDeleteStep = () => {
    if (selectedStep) {
      setSteps(steps.filter(s => s.id !== selectedStep.id));
      setSelectedStep(steps[0] || null);
    }
  };

  const handleAddTask = () => {
    if (selectedStep) {
      const updatedSteps = steps.map(s => {
        if (s.id === selectedStep.id) {
          return { ...s, tasks: [...s.tasks, "New task"] };
        }
        return s;
      });
      setSteps(updatedSteps);
      setSelectedStep({ ...selectedStep, tasks: [...selectedStep.tasks, "New task"] });
    }
  };

  const handleRemoveTask = (taskIndex) => {
    if (selectedStep) {
      const newTasks = selectedStep.tasks.filter((_, i) => i !== taskIndex);
      const updatedSteps = steps.map(s => {
        if (s.id === selectedStep.id) {
          return { ...s, tasks: newTasks };
        }
        return s;
      });
      setSteps(updatedSteps);
      setSelectedStep({ ...selectedStep, tasks: newTasks });
    }
  };

  const handleUpdateStep = (field, value) => {
    if (selectedStep) {
      const updatedSteps = steps.map(s => {
        if (s.id === selectedStep.id) {
          return { ...s, [field]: value };
        }
        return s;
      });
      setSteps(updatedSteps);
      setSelectedStep({ ...selectedStep, [field]: value });
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerTitle}>Career Roadmap Editor</div>
          <div style={styles.editBadge}>Edit Mode</div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.btnOutline}>View Mode</div>
          <div style={styles.btnOutlineWhite}>Preview</div>
          <div style={styles.btnPrimary}>Save</div>
          <div style={styles.avatarBtn}>
            <User size={16} color="#432DD7" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Panel - Steps */}
        <div style={styles.leftPanel}>
          <div style={styles.leftPanelHeader}>
            <div style={styles.sectionTitle}>Steps</div>
            <div style={styles.addStepBtn} onClick={handleAddStep}>
              <Plus size={14} color="white" />
              <span>Add Step</span>
            </div>
          </div>

          <div style={styles.stepsList}>
            {steps.map((step) => {
              const theme = colorThemes[step.theme];
              const isSelected = selectedStep?.id === step.id;
              return (
                <div
                  key={step.id}
                  style={{
                    ...styles.stepCard,
                    ...theme.card,
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                    boxShadow: isSelected 
                      ? "0px 4px 12px rgba(0, 0, 0, 0.15)"
                      : "0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)"
                  }}
                  onClick={() => handleStepClick(step)}
                >
                  <div style={styles.stepCardHeader}>
                    <div>
                      <div style={{ ...styles.stepCardTitle, color: theme.titleColor }}>{step.title}</div>
                      <div style={{ ...styles.stepCardDesc, color: theme.descColor }}>{step.description}</div>
                    </div>
                    <GripVertical size={16} color={theme.titleColor} />
                  </div>
                  <div style={styles.stepCardFooter}>
                    <ListTodo size={12} color={theme.iconColor} />
                    <span style={{ ...styles.taskCount, color: theme.iconColor }}>{step.tasks.length} tasks</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={styles.deleteBtn}>
            <div style={styles.deleteBtnInner} onClick={handleDeleteStep}>
              <Trash2 size={14} color="#C70036" />
              <span>Delete Selected</span>
            </div>
          </div>
        </div>

        {/* Center Panel - Canvas */}
        <div style={styles.centerPanel}>
          <div style={styles.canvas}>
            {steps.map((step) => {
              const theme = colorThemes[step.theme];
              const isSelected = selectedStep?.id === step.id;
              return (
                <div
                  key={step.id}
                  style={{
                    ...styles.canvasNode,
                    ...theme.node,
                    left: step.position.x,
                    top: step.position.y,
                    border: isSelected ? `4px solid ${theme.iconColor}` : theme.node.border
                  }}
                  onClick={() => handleStepClick(step)}
                >
                  <div style={styles.nodeHeader}>
                    <div>
                      <div style={{ ...styles.nodeTitle, color: theme.titleColor }}>{step.title}</div>
                      <div style={{ ...styles.nodeDesc, color: theme.descColor }}>{step.description}</div>
                    </div>
                    <GripVertical size={16} color={theme.titleColor} />
                  </div>
                  <div style={{ ...styles.nodeTasks, borderTop: `1px solid ${theme.borderColor}` }}>
                    {step.tasks.map((task, idx) => (
                      <div key={idx} style={styles.nodeTask}>
                        {idx === 0 && step.theme === "blue" ? (
                          <CheckCircle size={14} color={theme.iconColor} />
                        ) : (
                          <Circle size={14} color={theme.iconColor} />
                        )}
                        <span style={{ ...styles.nodeDesc, color: theme.taskColor }}>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div style={styles.canvasHint}>
              Drag nodes to reposition • Click to select • Drag from edges to connect
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div style={styles.rightPanel}>
          <div style={styles.aiSection}>
            <div style={styles.aiAvatar}>
              <Bot size={16} color="white" />
            </div>
            <div>
              <div style={styles.aiTitle}>AI Assistant</div>
              <div style={styles.aiSubtitle}>Ask for suggestions and improvements</div>
            </div>
          </div>

          <div style={styles.propertiesHeader}>
            <div style={styles.propertiesTitle}>Step Properties</div>
            <div style={styles.propertiesSubtitle}>Edit selected step details and tasks</div>
          </div>

          <div style={styles.propertiesContent}>
            {selectedStep && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Step Name</label>
                  <input
                    style={styles.formInput}
                    value={selectedStep.title}
                    onChange={(e) => handleUpdateStep("title", e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Description</label>
                  <textarea
                    style={styles.formTextarea}
                    value={selectedStep.description}
                    onChange={(e) => handleUpdateStep("description", e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <div style={styles.tasksHeader}>
                    <span style={styles.formLabel}>Tasks</span>
                    <div style={styles.addTaskBtn} onClick={handleAddTask}>
                      <Plus size={14} color="white" />
                      <span>Add Task</span>
                    </div>
                  </div>
                  <div style={{ flexDirection: "column", gap: 12, display: "flex", marginTop: 12 }}>
                    {selectedStep.tasks.map((task, idx) => (
                      <div key={idx} style={styles.taskItem}>
                        <div style={styles.taskItemLeft}>
                          <Circle size={16} color="#009966" />
                          <span style={styles.taskItemText}>{task}</span>
                        </div>
                        <X
                          size={16}
                          color="#009966"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveTask(idx)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
