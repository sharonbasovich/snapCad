import os
import subprocess

# Paths (edit these as needed)
images_path = "images"
workspace_path = "workspace"
database_path = os.path.join(workspace_path, "database.db")
sparse_path = os.path.join(workspace_path, "sparse")
dense_path = os.path.join(workspace_path, "dense")

def run_colmap_command(cmd_args, cwd=None):
    print(f"Running: {' '.join(cmd_args)}")
    subprocess.run(cmd_args, check=True, cwd=cwd)

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def run_reconstruction():
    ensure_dir(workspace_path)

    # Step 1: Feature Extraction
    run_colmap_command([
        "colmap", "feature_extractor",
        "--database_path", database_path,
        "--image_path", images_path
    ])

    # Step 2: Feature Matching
    run_colmap_command([
        "colmap", "exhaustive_matcher",
        "--database_path", database_path
    ])

    # Step 3: Sparse Reconstruction
    ensure_dir(sparse_path)
    run_colmap_command([
        "colmap", "mapper",
        "--database_path", database_path,
        "--image_path", images_path,
        "--output_path", sparse_path
    ])

    # Step 4: Undistort Images
    ensure_dir(dense_path)
    run_colmap_command([
        "colmap", "image_undistorter",
        "--image_path", images_path,
        "--input_path", os.path.join(sparse_path, "0"),
        "--output_path", dense_path,
        "--output_type", "COLMAP"
    ])

    # Step 5: Dense Reconstruction
    run_colmap_command([
        "colmap", "patch_match_stereo",
        "--workspace_path", dense_path,
        "--workspace_format", "COLMAP",
        "--PatchMatchStereo.geom_consistency", "true"
    ])

    # Step 6: Fuse Stereo Output
    run_colmap_command([
        "colmap", "stereo_fusion",
        "--workspace_path", dense_path,
        "--workspace_format", "COLMAP",
        "--input_type", "geometric",
        "--output_path", os.path.join(dense_path, "fused.ply")
    ])

    print("\n✅ Reconstruction completed.")
    print(f"🔽 Output mesh: {os.path.join(dense_path, 'fused.ply')}")

if __name__ == "__main__":
    run_reconstruction()
