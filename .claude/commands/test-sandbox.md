샌드박스 테스트를 위한 가이드를 제공합니다.

1. 현재 IP 주소를 확인합니다: `ipconfig getifaddr en0`
2. granite.config.ts의 host를 해당 IP로 업데이트할지 물어봅니다.
3. `npm run dev`를 실행합니다 (npx ait dev).
4. 테스트 방법을 안내합니다:
   - iOS 시뮬레이터: 샌드박스 앱 → `intoss://{appName}` 입력
   - iOS 실기기: 같은 Wi-Fi → 샌드박스 앱 → 서버 주소 입력
   - Android: `adb reverse tcp:8081 tcp:8081 && adb reverse tcp:5173 tcp:5173` → 샌드박스 앱 → `intoss://{appName}`
5. 개발 서버를 백그라운드로 돌려둡니다.
