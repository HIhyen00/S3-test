import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { FiMoreHorizontal } from "react-icons/fi";
import { FiX } from "react-icons/fi";
import { FiImage } from "react-icons/fi";
import { FiSettings } from "react-icons/fi";
import { FiHeart } from "react-icons/fi"; // 좋아요 아이콘 추가
import {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand, DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {useAuth} from "../context/AuthContext.tsx";
import { useLocation } from "react-router-dom";

const REGION = process.env.REACT_APP_S3_REGION!;
const BUCKET = process.env.REACT_APP_S3_BUCKET!;
const ACCESS_KEY = process.env.REACT_APP_S3_ACCESS_KEY!;
const SECRET_KEY = process.env.REACT_APP_S3_SECRET_KEY!;

const s3 = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    },
});

// 이미지 확장자 확인 유틸
const isImageFile = (filename: string) =>
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);

function S3Tester() {
    const [files, setFiles] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState<string | null>(null);
    // 좋아요 상태 변경 - 객체 형태로 수정
    const [fileLikes, setFileLikes] = useState<{[key: string]: {count: number, liked: boolean}}>({});
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState<string | null>(null); // 이미지 확대 모달
    const { currentUser, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    // 쿼리 파라미터로 접근 시 username은 항상 DevOps_01로 고정
    const hasUsernameParam = queryParams.has('username');
    // 쿼리 파라미터로 접근하는 경우 표시할 사용자 이름
    const displayUsername = hasUsernameParam ? "DevOps_01" : currentUser?.username;

    // 좋아요 토글 함수 추가
    const toggleLike = (fileKey: string) => {
        setFileLikes(prev => {
            const currentLike = prev[fileKey] || { count: Math.floor(Math.random() * 150) + 1, liked: false };
            return {
                ...prev,
                [fileKey]: {
                    count: currentLike.liked ? currentLike.count - 1 : currentLike.count + 1,
                    liked: !currentLike.liked
                }
            };
        });
    };

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await s3.send(
                new ListObjectsV2Command({
                    Bucket: BUCKET,
                    Prefix: "uploads/",
                })
            );
            const fetchedFiles = res.Contents || [];

            const sortedFiles = fetchedFiles.sort((a,b)=>
                new Date(b.LastModified!).getTime() - new Date(a.LastModified!).getTime()
            );

            setFiles(sortedFiles);

            // 새로운 파일들에 대해서만 좋아요 수 생성
            const newLikes = { ...fileLikes };
            fetchedFiles.forEach(file => {
                if (!newLikes[file.Key!]) {
                    newLikes[file.Key!] = {
                        count: Math.floor(Math.random() * 150) + 1,
                        liked: false
                    };
                }
            });
            setFileLikes(newLikes);
        } catch (err) {
            console.error("파일 목록 조회 실패:", err);
        }
        setLoading(false);
    };

    const uploadFile = async () => {
        if (!selectedFile) return;
        setLoading(true);

        const key = `uploads/${Date.now()}_${selectedFile.name}`;

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            await s3.send(
                new PutObjectCommand({
                    Bucket: BUCKET,
                    Key: key,
                    Body: uint8Array,
                    ContentType: selectedFile.type,
                })
            );
            setSelectedFile(null);
            setShowUploadModal(false);
            await fetchFiles();
            alert("업로드 완료");
        } catch (err) {
            console.error("업로드 실패:", err);
            alert("업로드 실패");
        }

        setLoading(false);
    };

    const deleteFile = async (key: string) => {
        if (!window.confirm("삭제할까요?")) return
        setLoading(true)

        try {
            await s3.send(
                new DeleteObjectCommand({
                    Bucket: BUCKET,
                    Key: key,
                })
            )

            await fetchFiles()
            alert('삭제 완료')
        } catch (err) {
            alert('삭제 실패')
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchFiles();
    }, []);

    // DevOps_01 사용자인지 확인 (현재 로그인한 사용자 또는 URL에 username 쿼리 파라미터가 있는 경우)
    const isDevOpsUser = currentUser?.username === "DevOps_01" || hasUsernameParam;
    
    return (
        <div className="max-w-5xl mx-auto p-8 bg-[#1a1a1a] text-white rounded-lg shadow-md mt-10">
            {/* 모달 닫기용 배경 - DevOps_01 사용자만 표시 */}
            {isDevOpsUser && (showModal || showUploadModal || showImageModal) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowModal(null);
                        setShowUploadModal(false);
                        setShowImageModal(null);
                    }}
                />
            )}

            {/* 프로필 섹션 - DevOps_01 사용자만 표시 */}
            {isDevOpsUser && <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-700">
                {/* 프로필 이미지 - DevOps_01 사용자만 표시 */}
                {isDevOpsUser && (
                    <div className="relative">
                        <img
                            src="/assets/profile.jpg"
                            alt=""
                            className="w-32 h-32 rounded-full object-cover border-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-1"
                            style={{
                                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                                padding: '3px'
                            }}
                        />
                    </div>
                )}

                {/* 프로필 정보 */}
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        {isDevOpsUser && <h1 className="text-3xl font-light">{displayUsername}</h1>}
                        {isDevOpsUser && (
                            <>
                                <button className="bg-blue-500 text-white px-4 py-1 rounded font-medium text-sm hover:bg-blue-600">
                                    팔로잉
                                </button>
                                <button className="bg-gray-200 text-black px-4 py-1 rounded font-medium text-sm hover:bg-gray-300">
                                    메시지 보내기
                                </button>
                                <div className="flex items-center gap-2">
                                    <button className="hover:bg-gray-100/50 hover:text-black p-1 rounded">
                                        <FiSettings />
                                    </button>
                                    <button className="hover:bg-gray-100/50 hover:text-black p-1 rounded">
                                        <FiMoreHorizontal />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 통계 정보 - DevOps_01 사용자만 표시 */}
                    {isDevOpsUser && (
                        <div className="flex gap-8 mb-4 text-white">
                            <span><strong className="text-gray-400">게시물 </strong><strong>{files.length}</strong></span>
                            <span><strong className="text-gray-400">팔로워</strong><strong> 1.5만</strong></span>
                            <span><strong className="text-gray-400">팔로우</strong><strong> 6</strong></span>
                        </div>
                    )}

                    {/* 소개 - DevOps_01 사용자만 표시 */}
                    {isDevOpsUser && (
                        <div className="text-sm">
                            <p className="text-gray-400">DevOps_team01🤗😏🙂😃😊</p>
                        </div>
                    )}
                </div>
            </div>}

            {isDevOpsUser && loading && (
                <p className="text-center text-sm text-gray-500 mb-4">
                    로딩중 ......
                </p>
            )}

            {!isDevOpsUser ? (
                <div className="text-center py-10">
                    <div className="text-6xl mb-4">📂</div>
                    <h2 className="text-2xl font-bold mb-2">비어 있음</h2>
                    <p className="text-gray-400 mb-6">표시할 내용이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                    {files.length === 0 && !loading && (
                        <p className="text-center text-gray-400 col-span-full">
                            파일이 존재하지 않습니다
                        </p>
                    )}

                    {files.map((file) => {
                    const fileName = file.Key.replace("uploads/", "")
                    const fileUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${file.Key}`
                    const isImage = isImageFile(fileName)
                    const likeData = fileLikes[file.Key!] || { count: 0, liked: false };

                    return (
                        <div key={file.Key}
                             className="aspect-square border border-[#1a1a1a] hover:shadow-md flex flex-col group relative overflow-hidden">

                            <div className="relative w-full h-full">
                                {isImage ? (
                                    <img src={fileUrl} alt={fileName}
                                         className="w-full h-full object-cover cursor-pointer"/>
                                ) : (
                                    <a href={fileUrl} target="_blank" rel="noreferrer"
                                       className="flex items-center justify-center w-full h-full bg-gray-100 text-blue-600 hover:underline">
                                        {fileName}
                                    </a>
                                )}

                                {/* 호버 시 나타나는 overlay */}
                                <div
                                    className={`absolute inset-0 bg-black bg-opacity-70 transition-opacity duration-300 cursor-pointer ${
                                        showModal === file.Key ? 'opacity-75' : 'opacity-0 group-hover:opacity-75'
                                    }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowImageModal(file.Key!);
                                    }}>

                                    {/* 좋아요 수와 좋아요 버튼 (중앙) */}
                                    <div className="flex items-center justify-center h-full">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleLike(file.Key!);
                                            }}
                                            className="flex items-center gap-2 text-white text-xl font-semibold hover:scale-110 transition-transform"
                                        >
                                            <span className="text-2xl">
                                                {likeData.liked ? '❤️' : '🤍'}
                                            </span>
                                            <span>{likeData.count}</span>
                                        </button>
                                    </div>

                                    {/* 점 세개 아이콘 (우상단) */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowModal(file.Key);
                                        }}
                                        className="absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-50 rounded-full
                                        flex items-center justify-center text-white hover:bg-opacity-70 z-10"
                                    >
                                        <FiMoreHorizontal className="size-5"/>
                                    </button>
                                </div>
                            </div>

                            {/* 모달 */}
                            {showModal === file.Key && (
                                <div className="absolute top-12 right-3 bg-white rounded-sm shadow-lg w-20 z-50 border border-gray-200">
                                    <button
                                        onClick={() => {
                                            setShowModal(null);
                                            alert('수정 기능은 아직 구현되지 않았습니다');
                                        }}
                                        className="w-full text-center text-[#1a1a1a] px-2 py-2 hover:bg-gray-100 border-b border-gray-200 text-sm"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowModal(null);
                                            deleteFile(file.Key!);
                                        }}
                                        className="w-full text-center px-2 py-2 hover:bg-gray-100 text-red-600 text-sm "
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
                </div>
            )}

            {/* 이미지 확대 모달 - DevOps_01 사용자만 표시 */}
            {isDevOpsUser && showImageModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-60 p-4"
                     onClick={() => setShowImageModal(null)}>
                    <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {/* 닫기 버튼 */}
                        <button
                            onClick={() => setShowImageModal(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full
                            flex items-center justify-center text-white hover:bg-black/70 z-10"
                        >
                            <FiX className="size-6"/>
                        </button>

                        {/* 확대된 이미지 */}
                        <img
                            src={`https://${BUCKET}.s3.${REGION}.amazonaws.com/${showImageModal}`}
                            alt="확대된 이미지"
                            className="max-w-full max-h-full object-contain"
                            style={{ maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 120px)' }}
                        />

                        {/* 하단 좋아요 및 정보 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                            <div className="flex items-center justify-between text-white max-w-full">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLike(showImageModal);
                                        }}
                                        className="flex items-center gap-2 hover:scale-110 transition-transform"
                                    >
                                        <span className="text-2xl">
                                            {fileLikes[showImageModal]?.liked ? '❤️' : '🤍'}
                                        </span>
                                        <span className="font-semibold">
                                            {fileLikes[showImageModal]?.count || 0}
                                        </span>
                                    </button>
                                </div>
                                <div className="text-sm text-gray-300 truncate ml-4">
                                    {showImageModal.replace("uploads/", "").replace(/^\d+_/, "")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 우하단 고정 플러스 버튼 - DevOps_01 사용자만 표시 */}
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-blue-500 text-white rounded-full
                    flex items-center justify-center text-2xl font-bold shadow-lg hover:bg-blue-600
                    transition-all duration-300 hover:scale-110 z-30"
                >
                    <FiPlus className="size-[32px]"/>
                </button>

            {/* 업로드 모달 - DevOps_01 사용자만 표시 */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
                         onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">새 게시물 만들기</h3>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setSelectedFile(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* 파일 선택 영역 */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <input
                                    id="uploadFileInput"
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <label
                                    htmlFor="uploadFileInput"
                                    className="cursor-pointer"
                                >
                                    {selectedFile ? (
                                        <div>
                                            <div className="flex items-center justify-center h-full mb-2 text-black"><FiImage className="size-16"/></div>
                                            <p className="text-gray-600">{selectedFile.name}</p>
                                            <p className="text-sm text-gray-400 mt-1">클릭해서 다른 파일 선택</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-center h-full mb-2 text-black"><FiImage className="size-16"/></div>
                                            <p className="text-gray-600">사진을 선택하세요</p>
                                            <p className="text-sm text-gray-400 mt-1">클릭해서 파일 선택</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* 업로드 버튼 */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setSelectedFile(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={uploadFile}
                                    disabled={!selectedFile || loading}
                                    className={`flex-1 px-4 py-2 text-white rounded transition ${
                                        selectedFile && !loading
                                            ? "bg-blue-500 hover:bg-blue-600"
                                            : "bg-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    {loading ? "업로드 중..." : "공유하기"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default S3Tester;