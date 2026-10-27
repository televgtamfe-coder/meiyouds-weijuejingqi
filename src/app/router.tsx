import { BianbianPage } from '../scenes/scene1/bianbian/BianbianPage';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Scene1Page } from '../scenes/scene1/Scene1Page';
import { Scene1HomePage } from '../scenes/scene1/Scene1HomePage';
import { Scene1MessagePage } from '../scenes/scene1/Scene1MessagePage';
import { Scene1MyPage } from '../scenes/scene1/Scene1MyPage';
import { Scene1PrepPage } from '../scenes/scene1/Scene1PrepPage';
import { Scene1ParentingPage } from '../scenes/scene1/Scene1ParentingPage';
import { Scene1PregnancyPage } from '../scenes/scene1/Scene1PregnancyPage';
import { Scene1BoneAssessmentPage } from '../scenes/scene1/Scene1BoneAssessmentPage';
import { Scene1BoneAssessmentResultPreviewPage } from '../scenes/scene1/Scene1BoneAssessmentResultPreviewPage';
import { Scene1ExerciseAssessmentPage } from '../scenes/scene1/Scene1ExerciseAssessmentPage';
import { Scene1ExerciseAssessmentResultPreviewPage } from '../scenes/scene1/Scene1ExerciseAssessmentResultPreviewPage';
import { Scene1Phq9AssessmentPage } from '../scenes/scene1/Scene1Phq9AssessmentPage';
import { Scene1Phq9AssessmentResultPreviewPage } from '../scenes/scene1/Scene1Phq9AssessmentResultPreviewPage';
import { Scene1Gad7AssessmentPage } from '../scenes/scene1/Scene1Gad7AssessmentPage';
import { Scene1Gad7AssessmentResultPreviewPage } from '../scenes/scene1/Scene1Gad7AssessmentResultPreviewPage';
import { Scene1EmqR13AssessmentPage } from '../scenes/scene1/Scene1EmqR13AssessmentPage';
import { Scene1EmqR13AssessmentResultPreviewPage } from '../scenes/scene1/Scene1EmqR13AssessmentResultPreviewPage';
import { Scene1MrsAssessmentPage } from '../scenes/scene1/Scene1MrsAssessmentPage';
import { Scene1MrsAssessmentResultPreviewPage } from '../scenes/scene1/Scene1MrsAssessmentResultPreviewPage';
import { Scene1PsqiAssessmentPage } from '../scenes/scene1/Scene1PsqiAssessmentPage';
import { Scene1PsqiAssessmentResultPreviewPage } from '../scenes/scene1/Scene1PsqiAssessmentResultPreviewPage';
import { Scene1IciqAssessmentPage } from '../scenes/scene1/Scene1IciqAssessmentPage';
import { Scene1IciqAssessmentResultPreviewPage } from '../scenes/scene1/Scene1IciqAssessmentResultPreviewPage';
import { Scene1AssessmentStageComparePage } from '../scenes/scene1/Scene1AssessmentStageComparePage';
import { Scene1AssessmentResultPreviewPage } from '../scenes/scene1/Scene1AssessmentResultPreviewPage';
import { RecordLandingPage } from '../scenes/record-shell/RecordLandingPage';
import { KegelReviewPage } from '../scenes/kegel-review/KegelReviewPage';
import { KegelTrainingPage } from '../scenes/kegel-training/KegelTrainingPage';
import { Scene2Page } from '../scenes/scene2/Scene2Page';
import { Scene3Page } from '../scenes/scene3/Scene3Page';

function SceneRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1Page />
      </div>
    </div>
  );
}

function ScenePerimenopauseRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1Page routeVariant="perimenopause" />
      </div>
    </div>
  );
}

function SceneHomeRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1HomePage />
      </div>
    </div>
  );
}

function SceneMyRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1MyPage />
      </div>
    </div>
  );
}

function SceneMessageRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1MessagePage />
      </div>
    </div>
  );
}

function SceneParentingRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1ParentingPage />
      </div>
    </div>
  );
}

function ScenePregnancyRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1PregnancyPage />
      </div>
    </div>
  );
}

function ScenePrepRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1PrepPage />
      </div>
    </div>
  );
}

function SceneBoneAssessmentRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1BoneAssessmentPage />
      </div>
    </div>
  );
}

function SceneBoneAssessmentResultRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1BoneAssessmentResultPreviewPage />
      </div>
    </div>
  );
}

function SceneExerciseAssessmentRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1ExerciseAssessmentPage />
      </div>
    </div>
  );
}

function SceneExerciseAssessmentResultRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1ExerciseAssessmentResultPreviewPage />
      </div>
    </div>
  );
}

function ScenePhq9AssessmentRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1Phq9AssessmentPage />
      </div>
    </div>
  );
}

function ScenePhq9AssessmentResultRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1Phq9AssessmentResultPreviewPage />
      </div>
    </div>
  );
}

function SceneGad7AssessmentRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1Gad7AssessmentPage />
      </div>
    </div>
  );
}

function SceneGad7AssessmentResultRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1Gad7AssessmentResultPreviewPage />
      </div>
    </div>
  );
}

function SceneEmqR13AssessmentRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1EmqR13AssessmentPage />
      </div>
    </div>
  );
}

function SceneEmqR13AssessmentResultRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1EmqR13AssessmentResultPreviewPage />
      </div>
    </div>
  );
}

function SceneMrsAssessmentRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1MrsAssessmentPage />
      </div>
    </div>
  );
}

function SceneMrsAssessmentResultRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1MrsAssessmentResultPreviewPage />
      </div>
    </div>
  );
}

function ScenePsqiAssessmentRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1PsqiAssessmentPage />
      </div>
    </div>
  );
}

function ScenePsqiAssessmentResultRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1PsqiAssessmentResultPreviewPage />
      </div>
    </div>
  );
}

function SceneIciqAssessmentRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1IciqAssessmentPage />
      </div>
    </div>
  );
}

function SceneIciqAssessmentResultRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1IciqAssessmentResultPreviewPage />
      </div>
    </div>
  );
}

function KegelReviewRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <KegelReviewPage />
      </div>
    </div>
  );
}

function KegelTrainingRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <KegelTrainingPage />
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/scene1-bone-assessment" element={<SceneBoneAssessmentRouteShell />} />
      <Route path="/scene1-bone-assessment-result" element={<SceneBoneAssessmentResultRouteShell />} />
      <Route path="/scene1-exercise-assessment" element={<SceneExerciseAssessmentRouteShell />} />
      <Route
        path="/scene1-exercise-assessment-result"
        element={<SceneExerciseAssessmentResultRouteShell />}
      />
      <Route path="/scene1-phq9-assessment" element={<ScenePhq9AssessmentRouteShell />} />
      <Route
        path="/scene1-phq9-assessment-result"
        element={<ScenePhq9AssessmentResultRouteShell />}
      />
      <Route path="/scene1-gad7-assessment" element={<SceneGad7AssessmentRouteShell />} />
      <Route
        path="/scene1-gad7-assessment-result"
        element={<SceneGad7AssessmentResultRouteShell />}
      />
      <Route path="/scene1-emq-r13-assessment" element={<SceneEmqR13AssessmentRouteShell />} />
      <Route
        path="/scene1-emq-r13-assessment-result"
        element={<SceneEmqR13AssessmentResultRouteShell />}
      />
      <Route path="/scene1-mrs-assessment" element={<SceneMrsAssessmentRouteShell />} />
      <Route
        path="/scene1-mrs-assessment-result"
        element={<SceneMrsAssessmentResultRouteShell />}
      />
      <Route path="/scene1-psqi-assessment" element={<ScenePsqiAssessmentRouteShell />} />
      <Route
        path="/scene1-psqi-assessment-result"
        element={<ScenePsqiAssessmentResultRouteShell />}
      />
      <Route path="/scene1-iciq-assessment" element={<SceneIciqAssessmentRouteShell />} />
      <Route
        path="/scene1-iciq-assessment-result"
        element={<SceneIciqAssessmentResultRouteShell />}
      />
      <Route path="/scene1-assessment-result" element={<SceneAssessmentResultRouteShell />} />
      <Route path="/scene1-assessment-stage-compare" element={<SceneAssessmentStageCompareRouteShell />} />
      <Route path="/scene1-prep" element={<ScenePrepRouteShell />} />
      <Route path="/scene1-pregnancy" element={<ScenePregnancyRouteShell />} />
      <Route path="/scene1-bianbian" element={<div className="app-root"><div className="phone-shell"><BianbianPage /></div></div>} />
      <Route path="/scene1-parenting" element={<SceneParentingRouteShell />} />
      <Route path="/scene1-home" element={<SceneHomeRouteShell />} />
      <Route path="/scene1-message" element={<SceneMessageRouteShell />} />
      <Route path="/scene1-my" element={<SceneMyRouteShell />} />
      <Route path="/scene1" element={<SceneRouteShell />} />
      <Route path="/scene1-perimenopause" element={<ScenePerimenopauseRouteShell />} />
      <Route path="/scene2" element={<Scene2Page />} />
      <Route path="/scene3" element={<Scene3Page />} />
      <Route path="/kegel-review" element={<KegelReviewRouteShell />} />
      <Route path="/kegel-training" element={<KegelTrainingRouteShell />} />
      <Route path="/record" element={<RecordLandingPage />} />
      <Route path="*" element={<Navigate to="/scene1" replace />} />
    </Routes>
  );
}

function SceneAssessmentStageCompareRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1AssessmentStageComparePage />
      </div>
    </div>
  );
}

function SceneAssessmentResultRouteShell() {
  return (
    <div className="app-root">
      <div className="phone-shell" data-testid="phone-shell">
        <Scene1AssessmentResultPreviewPage />
      </div>
    </div>
  );
}
